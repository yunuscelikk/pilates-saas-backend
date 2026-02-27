const { Membership, MembershipPlan, Member } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.memberId) where.member_id = query.memberId;
  if (query.status) where.status = query.status;

  const { count, rows } = await Membership.forStudio(studioId).findAndCountAll({
    where,
    include: [
      { model: Member, attributes: ['id', 'first_name', 'last_name'] },
      { model: MembershipPlan, attributes: ['id', 'name', 'plan_type'] },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { memberships: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const membership = await Membership.forStudio(studioId).findByPk(id, {
    include: [
      { model: Member, attributes: ['id', 'first_name', 'last_name'] },
      { model: MembershipPlan },
    ],
  });
  if (!membership) throw AppError.notFound('Membership not found');
  return membership;
};

const create = async (studioId, data) => {
  const member = await Member.forStudio(studioId).findByPk(data.memberId);
  if (!member) throw AppError.notFound('Member not found');

  const plan = await MembershipPlan.forStudio(studioId).findByPk(data.membershipPlanId);
  if (!plan) throw AppError.notFound('Membership plan not found');

  const startDate = new Date(data.startDate);
  let endDate = null;
  let classesRemaining = null;

  if (plan.plan_type === 'time_based' || plan.plan_type === 'unlimited') {
    if (plan.duration_days) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration_days);
    }
  }
  if (plan.plan_type === 'class_pack') {
    classesRemaining = plan.classes_included;
    if (plan.duration_days) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration_days);
    }
  }

  return Membership.create({
    studio_id: studioId,
    member_id: data.memberId,
    membership_plan_id: data.membershipPlanId,
    start_date: data.startDate,
    end_date: endDate,
    classes_remaining: classesRemaining,
  });
};

const update = async (studioId, id, data) => {
  const membership = await getById(studioId, id);
  const fields = {};
  if (data.status !== undefined) fields.status = data.status;
  if (data.endDate !== undefined) fields.end_date = data.endDate;
  if (data.classesRemaining !== undefined) fields.classes_remaining = data.classesRemaining;
  await membership.update(fields);
  return membership;
};

const freeze = async (studioId, id) => {
  const membership = await getById(studioId, id);
  if (membership.status !== 'active') throw AppError.badRequest('Only active memberships can be frozen');
  await membership.update({ status: 'frozen' });
  return membership;
};

const activate = async (studioId, id) => {
  const membership = await getById(studioId, id);
  if (membership.status !== 'frozen') throw AppError.badRequest('Only frozen memberships can be activated');
  await membership.update({ status: 'active' });
  return membership;
};

const remove = async (studioId, id) => {
  const membership = await getById(studioId, id);
  await membership.destroy(); // soft-delete
};

module.exports = { list, getById, create, update, freeze, activate, remove };
