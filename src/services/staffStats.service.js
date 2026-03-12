const { fn, col } = require("sequelize");
const { User } = require("../models");

const getStats = async (studioId) => {
  const studioScope = { studio_id: studioId };

  const [totalStaff, activeStaff, adminCount] = await Promise.all([
    User.count({ where: studioScope }),
    User.count({ where: { ...studioScope, is_active: true } }),
    User.count({ where: { ...studioScope, role: "admin" } }),
  ]);

  // Distribution by role
  const distributionRaw = await User.findAll({
    attributes: ["role", [fn("COUNT", col("id")), "count"]],
    where: studioScope,
    group: ["role"],
    raw: true,
  });

  const ROLE_LABELS = {
    owner: "Sahip",
    admin: "Yönetici",
    staff: "Personel",
  };

  const distribution = distributionRaw.map((r) => ({
    role: ROLE_LABELS[r.role] || r.role,
    count: parseInt(r.count, 10),
  }));

  return { totalStaff, activeStaff, adminCount, distribution };
};

module.exports = { getStats };
