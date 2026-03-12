const { Op, fn, col } = require("sequelize");
const { Membership } = require("../models");

const getStats = async (studioId) => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const sevenDaysFromNow = new Date(startOfToday);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const studioScope = { studio_id: studioId };

  const [totalMemberships, activeMemberships, frozenMemberships, expiringSoon] =
    await Promise.all([
      Membership.count({ where: studioScope }),
      Membership.count({ where: { ...studioScope, status: "active" } }),
      Membership.count({ where: { ...studioScope, status: "frozen" } }),
      Membership.count({
        where: {
          ...studioScope,
          status: "active",
          end_date: { [Op.between]: [startOfToday, sevenDaysFromNow] },
        },
      }),
    ]);

  // Distribution by status for chart
  const distributionRaw = await Membership.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    where: studioScope,
    group: ["status"],
    raw: true,
  });

  const STATUS_LABELS = {
    active: "Aktif",
    frozen: "Donduruldu",
    cancelled: "İptal",
    expired: "Süresi Doldu",
  };

  const distribution = distributionRaw.map((r) => ({
    status: STATUS_LABELS[r.status] || r.status,
    count: parseInt(r.count, 10),
  }));

  return {
    totalMemberships,
    activeMemberships,
    frozenMemberships,
    expiringSoon,
    distribution,
  };
};

module.exports = { getStats };
