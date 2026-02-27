const { Class } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.classType) where.class_type = query.classType;
  if (query.isActive !== undefined) where.is_active = query.isActive === 'true';

  const { count, rows } = await Class.forStudio(studioId).findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { classes: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const cls = await Class.forStudio(studioId).findByPk(id);
  if (!cls) throw AppError.notFound('Class not found');
  return cls;
};

const create = async (studioId, data) => {
  return Class.create({
    studio_id: studioId,
    name: data.name,
    description: data.description,
    duration_minutes: data.durationMinutes,
    max_capacity: data.maxCapacity,
    class_type: data.classType,
  });
};

const update = async (studioId, id, data) => {
  const cls = await getById(studioId, id);
  const fields = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.description !== undefined) fields.description = data.description;
  if (data.durationMinutes !== undefined) fields.duration_minutes = data.durationMinutes;
  if (data.maxCapacity !== undefined) fields.max_capacity = data.maxCapacity;
  if (data.classType !== undefined) fields.class_type = data.classType;
  if (data.isActive !== undefined) fields.is_active = data.isActive;
  await cls.update(fields);
  return cls;
};

const remove = async (studioId, id) => {
  const cls = await getById(studioId, id);
  await cls.destroy();
};

module.exports = { list, getById, create, update, remove };
