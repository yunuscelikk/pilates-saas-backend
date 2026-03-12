const { Op, fn, col } = require("sequelize");
const { Member, Membership } = require("../models");

const getStats = async (studioId) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const sevenDaysFromNow = new Date(startOfToday);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const studioScope = { studio_id: studioId };

  const [totalMembers, activeMembers, newThisMonth, expiringSoon] =
    await Promise.all([
      Member.count({ where: studioScope }),
      Member.count({ where: { ...studioScope, is_active: true } }),
      Member.count({
        where: {
          ...studioScope,
          created_at: { [Op.gte]: startOfMonth },
        },
      }),
      Membership.count({
        where: {
          ...studioScope,
          status: "active",
          end_date: { [Op.between]: [startOfToday, sevenDaysFromNow] },
        },
      }),
    ]);

  // Active / Passive distribution for pie chart
  const distributionRaw = await Member.findAll({
    attributes: ["is_active", [fn("COUNT", col("id")), "count"]],
    where: studioScope,
    group: ["is_active"],
    raw: true,
  });

  const distribution = distributionRaw.map((r) => ({
    status: r.is_active ? "Aktif" : "Pasif",
    count: parseInt(r.count, 10),
  }));

  return {
    totalMembers,
    activeMembers,
    newThisMonth,
    expiringSoon,
    distribution,
  };
};

module.exports = { getStats };
