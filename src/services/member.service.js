const { Op } = require('sequelize');
const { Member } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${query.search}%` } },
      { last_name: { [Op.iLike]: `%${query.search}%` } },
      { email: { [Op.iLike]: `%${query.search}%` } },
      { phone: { [Op.iLike]: `%${query.search}%` } },
    ];
  }
  if (query.isActive !== undefined) {
    where.is_active = query.isActive === 'true';
  }

  const { count, rows } = await Member.forStudio(studioId).findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { members: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const member = await Member.forStudio(studioId).findByPk(id);
  if (!member) throw AppError.notFound('Member not found');
  return member;
};

const create = async (studioId, data) => {
  return Member.create({
    studio_id: studioId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    date_of_birth: data.dateOfBirth,
    gender: data.gender,
    emergency_contact_name: data.emergencyContactName,
    emergency_contact_phone: data.emergencyContactPhone,
    notes: data.notes,
    joined_at: data.joinedAt || new Date(),
  });
};

const update = async (studioId, id, data) => {
  const member = await getById(studioId, id);
  const fields = {};
  if (data.firstName !== undefined) fields.first_name = data.firstName;
  if (data.lastName !== undefined) fields.last_name = data.lastName;
  if (data.email !== undefined) fields.email = data.email;
  if (data.phone !== undefined) fields.phone = data.phone;
  if (data.dateOfBirth !== undefined) fields.date_of_birth = data.dateOfBirth;
  if (data.gender !== undefined) fields.gender = data.gender;
  if (data.emergencyContactName !== undefined) fields.emergency_contact_name = data.emergencyContactName;
  if (data.emergencyContactPhone !== undefined) fields.emergency_contact_phone = data.emergencyContactPhone;
  if (data.notes !== undefined) fields.notes = data.notes;
  if (data.isActive !== undefined) fields.is_active = data.isActive;
  await member.update(fields);
  return member;
};

const remove = async (studioId, id) => {
  const member = await getById(studioId, id);
  await member.destroy(); // soft-delete (paranoid)
};

module.exports = { list, getById, create, update, remove };
