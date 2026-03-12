const { Op, fn, col } = require("sequelize");
const { Booking } = require("../models");

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

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const studioScope = { studio_id: studioId };

  const [bookingsToday, cancelledToday, pendingCount] = await Promise.all([
    Booking.count({
      where: {
        ...studioScope,
        status: "confirmed",
        booked_at: { [Op.between]: [startOfToday, endOfToday] },
      },
    }),
    Booking.count({
      where: {
        ...studioScope,
        status: "cancelled",
        cancelled_at: { [Op.between]: [startOfToday, endOfToday] },
      },
    }),
    Booking.count({
      where: { ...studioScope, status: "waitlisted" },
    }),
  ]);

  // Daily bookings chart (last 7 days)
  const dailyRaw = await Booking.findAll({
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

  const dailyMap = {};
  dailyRaw.forEach((r) => {
    dailyMap[r.date] = parseInt(r.count, 10);
  });

  const dailyChart = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyChart.push({ date: key, count: dailyMap[key] || 0 });
  }

  return {
    bookingsToday,
    cancelledToday,
    pendingCount,
    dailyChart,
  };
};

module.exports = { getStats };
