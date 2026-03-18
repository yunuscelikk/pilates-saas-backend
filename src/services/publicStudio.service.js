const { Op } = require('sequelize');
const { Studio, Class, ClassSession, Trainer, Booking } = require('../models');
const AppError = require('../utils/AppError');

const getStudioBySlug = async (slug) => {
  const studio = await Studio.findOne({
    where: { slug, is_active: true },
    attributes: ['id', 'name', 'slug', 'address', 'phone', 'email', 'settings'],
  });
  if (!studio) throw AppError.notFound('Studio not found');
  return studio;
};

const getClasses = async (studioId) => {
  const classes = await Class.findAll({
    where: { studio_id: studioId, is_active: true },
    attributes: ['id', 'name', 'description', 'duration_minutes', 'max_capacity', 'class_type'],
    order: [['name', 'ASC']],
  });
  return classes;
};

const getSessions = async (studioId, { date, startDate, endDate }) => {
  const where = {
    studio_id: studioId,
    status: { [Op.ne]: 'cancelled' },
  };

  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    where.start_time = { [Op.between]: [dayStart, dayEnd] };
  } else if (startDate && endDate) {
    where.start_time = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  } else {
    // Default: today onwards
    where.start_time = { [Op.gte]: new Date() };
  }

  const sessions = await ClassSession.findAll({
    where,
    include: [
      { model: Class, attributes: ['id', 'name', 'description', 'duration_minutes', 'max_capacity', 'class_type'] },
      { model: Trainer, attributes: ['id', 'first_name', 'last_name'] },
    ],
    order: [['start_time', 'ASC']],
  });

  return sessions;
};

const getSessionById = async (studioId, sessionId) => {
  const session = await ClassSession.findOne({
    where: { id: sessionId, studio_id: studioId },
    include: [
      { model: Class, attributes: ['id', 'name', 'description', 'duration_minutes', 'max_capacity', 'class_type'] },
      { model: Trainer, attributes: ['id', 'first_name', 'last_name'] },
      {
        model: Booking,
        attributes: ['id', 'status'],
        where: { status: { [Op.ne]: 'cancelled' } },
        required: false,
      },
    ],
  });
  if (!session) throw AppError.notFound('Session not found');
  return session;
};

module.exports = { getStudioBySlug, getClasses, getSessions, getSessionById };
