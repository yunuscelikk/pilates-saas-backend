const { Trainer } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.isActive !== undefined) where.is_active = query.isActive === 'true';

  const { count, rows } = await Trainer.forStudio(studioId).findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { trainers: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const trainer = await Trainer.forStudio(studioId).findByPk(id);
  if (!trainer) throw AppError.notFound('Trainer not found');
  return trainer;
};

const create = async (studioId, data) => {
  return Trainer.create({
    studio_id: studioId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    specializations: data.specializations,
    bio: data.bio,
  });
};

const update = async (studioId, id, data) => {
  const trainer = await getById(studioId, id);
  const fields = {};
  if (data.firstName !== undefined) fields.first_name = data.firstName;
  if (data.lastName !== undefined) fields.last_name = data.lastName;
  if (data.email !== undefined) fields.email = data.email;
  if (data.phone !== undefined) fields.phone = data.phone;
  if (data.specializations !== undefined) fields.specializations = data.specializations;
  if (data.bio !== undefined) fields.bio = data.bio;
  if (data.isActive !== undefined) fields.is_active = data.isActive;
  await trainer.update(fields);
  return trainer;
};

const remove = async (studioId, id) => {
  const trainer = await getById(studioId, id);
  await trainer.destroy();
};

module.exports = { list, getById, create, update, remove };
