const { Op, fn, col } = require("sequelize");
const { Class, ClassSession } = require("../models");

const getStats = async (studioId) => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const studioScope = { studio_id: studioId };

  const [totalClasses, activeClasses, sessionsToday, avgCapacity] =
    await Promise.all([
      Class.count({ where: studioScope }),
      Class.count({ where: { ...studioScope, is_active: true } }),
      ClassSession.count({
        where: {
          ...studioScope,
          start_time: { [Op.between]: [startOfToday, endOfToday] },
          status: "scheduled",
        },
      }),
      Class.findOne({
        attributes: [[fn("AVG", col("max_capacity")), "avg"]],
        where: studioScope,
        raw: true,
      }),
    ]);

  // Distribution by class_type for chart
  const distributionRaw = await Class.findAll({
    attributes: ["class_type", [fn("COUNT", col("id")), "count"]],
    where: studioScope,
    group: ["class_type"],
    raw: true,
  });

  const TYPE_LABELS = {
    group: "Grup",
    private: "Özel",
    semi_private: "Yarı Özel",
  };

  const distribution = distributionRaw.map((r) => ({
    type: TYPE_LABELS[r.class_type] || r.class_type,
    count: parseInt(r.count, 10),
  }));

  return {
    totalClasses,
    activeClasses,
    sessionsToday,
    avgCapacity: avgCapacity?.avg ? Math.round(Number(avgCapacity.avg)) : 0,
    distribution,
  };
};

module.exports = { getStats };
