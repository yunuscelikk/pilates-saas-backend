const { MembershipPlan } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.planType) where.plan_type = query.planType;
  if (query.isActive !== undefined) where.is_active = query.isActive === 'true';

  const { count, rows } = await MembershipPlan.forStudio(studioId).findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { membershipPlans: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const plan = await MembershipPlan.forStudio(studioId).findByPk(id);
  if (!plan) throw AppError.notFound('Membership plan not found');
  return plan;
};

const create = async (studioId, data) => {
  // Validate plan_type specific fields
  if (data.planType === 'class_pack' && !data.classesIncluded) {
    throw AppError.badRequest('classes_included is required for class_pack plans');
  }
  if (data.planType === 'time_based' && !data.durationDays) {
    throw AppError.badRequest('duration_days is required for time_based plans');
  }

  return MembershipPlan.create({
    studio_id: studioId,
    name: data.name,
    description: data.description,
    plan_type: data.planType,
    classes_included: data.classesIncluded,
    duration_days: data.durationDays,
    price: data.price,
    currency: data.currency,
  });
};

const update = async (studioId, id, data) => {
  const plan = await getById(studioId, id);
  const fields = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.description !== undefined) fields.description = data.description;
  if (data.planType !== undefined) fields.plan_type = data.planType;
  if (data.classesIncluded !== undefined) fields.classes_included = data.classesIncluded;
  if (data.durationDays !== undefined) fields.duration_days = data.durationDays;
  if (data.price !== undefined) fields.price = data.price;
  if (data.currency !== undefined) fields.currency = data.currency;
  if (data.isActive !== undefined) fields.is_active = data.isActive;
  await plan.update(fields);
  return plan;
};

const remove = async (studioId, id) => {
  const plan = await getById(studioId, id);
  await plan.destroy();
};

module.exports = { list, getById, create, update, remove };
