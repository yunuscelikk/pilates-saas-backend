const { Op } = require("sequelize");
const { sequelize, Payment } = require("../models");

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

  const studioScope = { studio_id: studioId };

  const [revenueToday, revenueThisMonth, pendingPayments] = await Promise.all([
    Payment.sum("amount", {
      where: {
        ...studioScope,
        status: "completed",
        payment_date: { [Op.between]: [startOfToday, endOfToday] },
      },
    }),
    Payment.sum("amount", {
      where: {
        ...studioScope,
        status: "completed",
        payment_date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    }),
    Payment.count({
      where: { ...studioScope, status: "pending" },
    }),
  ]);

  // Monthly revenue chart (last 6 months)
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  const monthlyRaw = await sequelize.query(
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

  const monthlyMap = {};
  monthlyRaw.forEach((r) => {
    monthlyMap[r.month] = parseFloat(r.total);
  });

  const monthlyChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyChart.push({ month: key, total: monthlyMap[key] || 0 });
  }

  return {
    revenueToday: revenueToday || 0,
    revenueThisMonth: revenueThisMonth || 0,
    pendingPayments,
    monthlyChart,
  };
};

module.exports = { getStats };
