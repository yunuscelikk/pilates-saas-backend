const { Op } = require('sequelize');
const { ClassSession, Class, Trainer } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.startDate && query.endDate) {
    where.start_time = { [Op.between]: [new Date(query.startDate), new Date(query.endDate)] };
  } else if (query.startDate) {
    where.start_time = { [Op.gte]: new Date(query.startDate) };
  }
  if (query.status) where.status = query.status;
  if (query.classId) where.class_id = query.classId;
  if (query.trainerId) where.trainer_id = query.trainerId;

  const { count, rows } = await ClassSession.forStudio(studioId).findAndCountAll({
    where,
    include: [
      { model: Class, attributes: ['id', 'name', 'class_type', 'max_capacity'] },
      { model: Trainer, attributes: ['id', 'first_name', 'last_name'] },
    ],
    limit,
    offset,
    order: [['start_time', 'ASC']],
  });
  return { classSessions: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const session = await ClassSession.forStudio(studioId).findByPk(id, {
    include: [
      { model: Class, attributes: ['id', 'name', 'class_type', 'max_capacity'] },
      { model: Trainer, attributes: ['id', 'first_name', 'last_name'] },
    ],
  });
  if (!session) throw AppError.notFound('Class session not found');
  return session;
};

const create = async (studioId, data) => {
  // Validate class belongs to studio
  const cls = await Class.forStudio(studioId).findByPk(data.classId);
  if (!cls) throw AppError.notFound('Class not found in this studio');

  if (data.trainerId) {
    const trainer = await Trainer.forStudio(studioId).findByPk(data.trainerId);
    if (!trainer) throw AppError.notFound('Trainer not found in this studio');
  }

  return ClassSession.create({
    studio_id: studioId,
    class_id: data.classId,
    trainer_id: data.trainerId,
    start_time: data.startTime,
    end_time: data.endTime,
    notes: data.notes,
  });
};

const update = async (studioId, id, data) => {
  const session = await getById(studioId, id);
  const fields = {};
  if (data.trainerId !== undefined) {
    if (data.trainerId) {
      const trainer = await Trainer.forStudio(studioId).findByPk(data.trainerId);
      if (!trainer) throw AppError.notFound('Trainer not found in this studio');
    }
    fields.trainer_id = data.trainerId;
  }
  if (data.startTime !== undefined) fields.start_time = data.startTime;
  if (data.endTime !== undefined) fields.end_time = data.endTime;
  if (data.status !== undefined) fields.status = data.status;
  if (data.notes !== undefined) fields.notes = data.notes;
  await session.update(fields);
  return session;
};

const remove = async (studioId, id) => {
  const session = await getById(studioId, id);
  await session.destroy();
};

module.exports = { list, getById, create, update, remove };
