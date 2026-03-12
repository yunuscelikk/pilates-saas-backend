const { Op, fn, col, literal } = require("sequelize");
const {
  sequelize,
  Member,
  Membership,
  Booking,
  ClassSession,
  Payment,
} = require("../models");

const getStats = async (studioId) => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
  );

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const sevenDaysFromNow = new Date(startOfToday);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const studioScope = { studio_id: studioId };

  // --- Summary Stats ---
  const [
    totalMembers,
    activeMembers,
    activeMemberships,
    expiringMemberships,
    todaySessions,
    totalBookings,
    monthlyBookings,
    monthlyRevenue,
  ] = await Promise.all([
    Member.count({ where: studioScope }),
    Member.count({ where: { ...studioScope, is_active: true } }),
    Membership.count({ where: { ...studioScope, status: "active" } }),
    Membership.count({
      where: {
        ...studioScope,
        status: "active",
        end_date: { [Op.between]: [startOfToday, sevenDaysFromNow] },
      },
    }),
    ClassSession.count({
      where: {
        ...studioScope,
        status: "scheduled",
        start_time: { [Op.between]: [startOfToday, endOfToday] },
      },
    }),
    Booking.count({ where: studioScope }),
    Booking.count({
      where: {
        ...studioScope,
        status: "confirmed",
        booked_at: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    }),
    Payment.sum("amount", {
      where: {
        ...studioScope,
        status: "completed",
        payment_date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    }),
  ]);

  // --- Daily Bookings (last 7 days) ---
  const dailyBookingsRaw = await Booking.findAll({
    attributes: [
      [fn("DATE", col("booked_at")), "date"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      ...studioScope,
      booked_at: { [Op.gte]: sevenDaysAgo },
    },
    group: [fn("DATE", col("booked_at"))],
    order: [[fn("DATE", col("booked_at")), "ASC"]],
    raw: true,
  });

  const dailyBookingsMap = {};
  dailyBookingsRaw.forEach((r) => {
    dailyBookingsMap[r.date] = parseInt(r.count, 10);
  });

  const dailyBookings = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyBookings.push({ date: key, count: dailyBookingsMap[key] || 0 });
  }

  // --- Monthly Revenue (last 6 months) ---
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  const monthlyRevenueRaw = await sequelize.query(
    `SELECT
       TO_CHAR(payment_date, 'YYYY-MM') AS month,
       COALESCE(SUM(amount), 0) AS total
     FROM payments
     WHERE studio_id = :studioId
       AND status = 'completed'
       AND payment_date >= :since
     GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
     ORDER BY month ASC`,
    {
      replacements: {
        studioId,
        since: sixMonthsAgo.toISOString().split("T")[0],
      },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  const monthlyRevenueMap = {};
  monthlyRevenueRaw.forEach((r) => {
    monthlyRevenueMap[r.month] = parseFloat(r.total);
  });

  const monthlyRevenueChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueChart.push({
      month: key,
      total: monthlyRevenueMap[key] || 0,
    });
  }

  // --- Member Active/Passive Distribution ---
  const memberDistRaw = await Member.findAll({
    attributes: ["is_active", [fn("COUNT", col("id")), "count"]],
    where: studioScope,
    group: ["is_active"],
    raw: true,
  });

  const membershipDistribution = memberDistRaw.map((r) => ({
    status: r.is_active ? "active" : "passive",
    count: parseInt(r.count, 10),
  }));

  return {
    summary: {
      totalMembers,
      activeMembers,
      activeMemberships,
      expiringMemberships,
      todaySessions,
      totalBookings,
      monthlyBookings,
      monthlyRevenue: parseFloat(monthlyRevenue) || 0,
    },
    charts: {
      dailyBookings,
      monthlyRevenue: monthlyRevenueChart,
      membershipDistribution,
    },
  };
};

const getAdvancedStats = async (studioId) => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const studioScope = { studio_id: studioId };

  // --- Class popularity (top 10 by booking count) ---
  const classPopularity = await sequelize.query(
    `SELECT c.name, COUNT(b.id)::int AS booking_count
     FROM classes c
     LEFT JOIN class_sessions cs ON cs.class_id = c.id AND cs.studio_id = :studioId
     LEFT JOIN bookings b ON b.class_session_id = cs.id AND b.status = 'confirmed'
     WHERE c.studio_id = :studioId
     GROUP BY c.id, c.name
     ORDER BY booking_count DESC
     LIMIT 10`,
    {
      replacements: { studioId },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  // --- Trainer workload (sessions per trainer, last 30 days) ---
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trainerWorkload = await sequelize.query(
    `SELECT t.first_name || ' ' || t.last_name AS name,
            COUNT(cs.id)::int AS session_count
     FROM trainers t
     LEFT JOIN class_sessions cs ON cs.trainer_id = t.id
       AND cs.studio_id = :studioId
       AND cs.start_time >= :since
     WHERE t.studio_id = :studioId AND t.is_active = true
     GROUP BY t.id, t.first_name, t.last_name
     ORDER BY session_count DESC`,
    {
      replacements: { studioId, since: thirtyDaysAgo.toISOString() },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  // --- Occupancy rate (last 30 days) ---
  const occupancyData = await sequelize.query(
    `SELECT
       COUNT(b.id)::int AS total_bookings,
       SUM(c.max_capacity)::int AS total_capacity
     FROM class_sessions cs
     JOIN classes c ON c.id = cs.class_id
     LEFT JOIN bookings b ON b.class_session_id = cs.id AND b.status = 'confirmed'
     WHERE cs.studio_id = :studioId
       AND cs.start_time >= :since
       AND cs.status != 'cancelled'`,
    {
      replacements: { studioId, since: thirtyDaysAgo.toISOString() },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  const totalBookings = occupancyData[0]?.total_bookings || 0;
  const totalCapacity = occupancyData[0]?.total_capacity || 0;
  const occupancyRate =
    totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

  // --- Revenue by payment method ---
  const revenueByMethod = await sequelize.query(
    `SELECT payment_method AS method,
            COALESCE(SUM(amount), 0)::float AS total
     FROM payments
     WHERE studio_id = :studioId AND status = 'completed'
     GROUP BY payment_method
     ORDER BY total DESC`,
    {
      replacements: { studioId },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  // --- New members trend (last 6 months) ---
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  const newMembersTrend = await sequelize.query(
    `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
            COUNT(id)::int AS count
     FROM members
     WHERE studio_id = :studioId
       AND created_at >= :since
     GROUP BY TO_CHAR(created_at, 'YYYY-MM')
     ORDER BY month ASC`,
    {
      replacements: {
        studioId,
        since: sixMonthsAgo.toISOString().split("T")[0],
      },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  return {
    classPopularity,
    trainerWorkload,
    occupancyRate,
    revenueByMethod,
    newMembersTrend,
  };
};

module.exports = { getStats, getAdvancedStats };
