const { sequelize, Attendance, Member, ClassSession, Membership, MembershipPlan } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.memberId) where.member_id = query.memberId;
  if (query.classSessionId) where.class_session_id = query.classSessionId;

  const { count, rows } = await Attendance.forStudio(studioId).findAndCountAll({
    where,
    include: [
      { model: Member, attributes: ['id', 'first_name', 'last_name'] },
      { model: ClassSession, attributes: ['id', 'start_time', 'end_time'] },
    ],
    limit,
    offset,
    order: [['check_in_time', 'DESC']],
  });
  return { attendances: rows, pagination: formatPagination(count, page, limit) };
};

const checkIn = async (studioId, data) => {
  return sequelize.transaction(async (t) => {
    const member = await Member.forStudio(studioId).findByPk(data.memberId, { transaction: t });
    if (!member) throw AppError.notFound('Member not found');

    const session = await ClassSession.forStudio(studioId).findByPk(data.classSessionId, { transaction: t });
    if (!session) throw AppError.notFound('Class session not found');

    // Check duplicate
    const existing = await Attendance.findOne({
      where: { member_id: data.memberId, class_session_id: data.classSessionId },
      transaction: t,
    });
    if (existing) throw AppError.conflict('Already checked in');

    // Decrement classes_remaining on active class_pack membership
    const membership = await Membership.findOne({
      where: { member_id: data.memberId, studio_id: studioId, status: 'active' },
      include: [{ model: MembershipPlan, where: { plan_type: 'class_pack' } }],
      transaction: t,
    });
    if (membership) {
      if (membership.classes_remaining !== null && membership.classes_remaining <= 0) {
        throw AppError.badRequest('No classes remaining on membership');
      }
      if (membership.classes_remaining !== null) {
        await membership.decrement('classes_remaining', { transaction: t });
      }
    }

    return Attendance.create({
      studio_id: studioId,
      member_id: data.memberId,
      class_session_id: data.classSessionId,
    }, { transaction: t });
  });
};

const checkOut = async (studioId, id) => {
  const attendance = await Attendance.forStudio(studioId).findByPk(id);
  if (!attendance) throw AppError.notFound('Attendance not found');
  if (attendance.status === 'checked_out') throw AppError.badRequest('Already checked out');
  await attendance.update({ status: 'checked_out', check_out_time: new Date() });
  return attendance;
};

module.exports = { list, checkIn, checkOut };
