const { Op, fn, col } = require("sequelize");
const { Trainer, ClassSession } = require("../models");

const getStats = async (studioId) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const studioScope = { studio_id: studioId };

  const [totalTrainers, activeTrainers, newThisMonth, classesThisWeek] =
    await Promise.all([
      Trainer.count({ where: studioScope }),
      Trainer.count({ where: { ...studioScope, is_active: true } }),
      Trainer.count({
        where: {
          ...studioScope,
          created_at: {
            [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
      }),
      ClassSession.count({
        where: {
          ...studioScope,
          start_time: { [Op.between]: [startOfWeek, endOfWeek] },
          status: { [Op.ne]: "cancelled" },
        },
      }),
    ]);

  return { totalTrainers, activeTrainers, newThisMonth, classesThisWeek };
};

module.exports = { getStats };
