const { Op } = require('sequelize');
const { sequelize, Booking, ClassSession, Class, Membership, MembershipPlan, Member, Payment, Trainer } = require('../models');
const AppError = require('../utils/AppError');

const createBooking = async (studioId, memberId, sessionId) => {
  return sequelize.transaction(async (t) => {
    const session = await ClassSession.findOne({
      where: { id: sessionId, studio_id: studioId },
      include: [{ model: Class }],
      transaction: t,
      lock: { level: t.LOCK.UPDATE, of: ClassSession },
    });
    if (!session) throw AppError.notFound('Session not found');
    if (session.status === 'cancelled') throw AppError.badRequest('Session is cancelled');

    // Check for duplicate booking
    const existing = await Booking.findOne({
      where: { member_id: memberId, class_session_id: sessionId },
      transaction: t,
    });
    if (existing && existing.status !== 'cancelled') {
      throw AppError.conflict('You have already booked this session');
    }

    // Check active membership
    const membership = await Membership.findOne({
      where: {
        studio_id: studioId,
        member_id: memberId,
        status: 'active',
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: new Date() } },
        ],
      },
      include: [{ model: MembershipPlan }],
      transaction: t,
    });
    if (!membership) {
      throw AppError.badRequest('You do not have an active membership');
    }

    // Check class pack remaining
    if (membership.MembershipPlan.plan_type === 'class_pack') {
      if (membership.classes_remaining <= 0) {
        throw AppError.badRequest('No remaining classes on your membership');
      }
    }

    // Check capacity
    let status = 'confirmed';
    if (session.current_capacity >= session.Class.max_capacity) {
      status = 'waitlisted';
    } else {
      await session.increment('current_capacity', { transaction: t });
    }

    const booking = await Booking.create(
      {
        studio_id: studioId,
        member_id: memberId,
        class_session_id: sessionId,
        status,
        booked_at: new Date(),
      },
      { transaction: t },
    );

    // Decrement class pack
    if (status === 'confirmed' && membership.MembershipPlan.plan_type === 'class_pack') {
      await membership.decrement('classes_remaining', { transaction: t });
    }

    return booking;
  });
};

const cancelBooking = async (studioId, memberId, bookingId) => {
  return sequelize.transaction(async (t) => {
    const booking = await Booking.findOne({
      where: { id: bookingId, studio_id: studioId, member_id: memberId },
      include: [{ model: ClassSession }],
      transaction: t,
    });
    if (!booking) throw AppError.notFound('Booking not found');
    if (booking.status === 'cancelled') throw AppError.badRequest('Booking already cancelled');

    const wasConfirmed = booking.status === 'confirmed';
    await booking.update({ status: 'cancelled', cancelled_at: new Date() }, { transaction: t });

    if (wasConfirmed) {
      await booking.ClassSession.decrement('current_capacity', { transaction: t });

      // Refund class pack credit
      const membership = await Membership.findOne({
        where: { studio_id: studioId, member_id: memberId, status: 'active' },
        include: [{ model: MembershipPlan }],
        transaction: t,
      });
      if (membership && membership.MembershipPlan.plan_type === 'class_pack') {
        await membership.increment('classes_remaining', { transaction: t });
      }

      // Promote first waitlisted
      const waitlisted = await Booking.findOne({
        where: { class_session_id: booking.class_session_id, status: 'waitlisted' },
        order: [['booked_at', 'ASC']],
        transaction: t,
      });
      if (waitlisted) {
        await waitlisted.update({ status: 'confirmed' }, { transaction: t });
        await booking.ClassSession.increment('current_capacity', { transaction: t });
      }
    }

    return booking;
  });
};

const getMyBookings = async (studioId, memberId, { upcoming, past } = {}) => {
  const where = { studio_id: studioId, member_id: memberId };

  const includeSession = {
    model: ClassSession,
    include: [
      { model: Class, attributes: ['id', 'name', 'duration_minutes'] },
      { model: Trainer, attributes: ['id', 'first_name', 'last_name'] },
    ],
  };

  if (upcoming) {
    includeSession.where = { start_time: { [Op.gte]: new Date() } };
  } else if (past) {
    includeSession.where = { start_time: { [Op.lt]: new Date() } };
  }

  const bookings = await Booking.findAll({
    where,
    include: [includeSession],
    order: [[ClassSession, 'start_time', upcoming ? 'ASC' : 'DESC']],
  });
  return bookings;
};

const getMyMemberships = async (studioId, memberId) => {
  const memberships = await Membership.findAll({
    where: { studio_id: studioId, member_id: memberId },
    include: [{ model: MembershipPlan, attributes: ['id', 'name', 'plan_type', 'classes_included', 'duration_days', 'price', 'currency'] }],
    order: [['start_date', 'DESC']],
  });
  return memberships;
};

const getMyPayments = async (studioId, memberId) => {
  const payments = await Payment.findAll({
    where: { studio_id: studioId, member_id: memberId },
    include: [
      { model: Membership, attributes: ['id'], include: [{ model: MembershipPlan, attributes: ['id', 'name'] }] },
    ],
    order: [['payment_date', 'DESC']],
  });
  return payments;
};

module.exports = { createBooking, cancelBooking, getMyBookings, getMyMemberships, getMyPayments };
