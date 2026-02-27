const { User } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const { count, rows } = await User.forStudio(studioId).findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { users: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const user = await User.forStudio(studioId).findByPk(id);
  if (!user) throw AppError.notFound('User not found');
  return user;
};

const create = async (studioId, data) => {
  const user = await User.create({
    studio_id: studioId,
    email: data.email,
    password: data.password,
    first_name: data.firstName,
    last_name: data.lastName,
    role: data.role,
  });
  return user;
};

const update = async (studioId, id, data) => {
  const user = await getById(studioId, id);
  const fields = {};
  if (data.email !== undefined) fields.email = data.email;
  if (data.password !== undefined) fields.password = data.password;
  if (data.firstName !== undefined) fields.first_name = data.firstName;
  if (data.lastName !== undefined) fields.last_name = data.lastName;
  if (data.role !== undefined) fields.role = data.role;
  if (data.isActive !== undefined) fields.is_active = data.isActive;
  await user.update(fields);
  return user;
};

const remove = async (studioId, id, currentUserId) => {
  if (id === currentUserId) throw AppError.badRequest('Cannot delete yourself');
  const user = await getById(studioId, id);
  await user.destroy();
};

module.exports = { list, getById, create, update, remove };
