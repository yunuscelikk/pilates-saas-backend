const {
  sequelize,
  Booking,
  ClassSession,
  Class,
  Member,
} = require("../models");
const AppError = require("../utils/AppError");
const { getPagination, formatPagination } = require("../utils/pagination");

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.memberId) where.member_id = query.memberId;
  if (query.classSessionId) where.class_session_id = query.classSessionId;
  if (query.status) where.status = query.status;

  const { count, rows } = await Booking.forStudio(studioId).findAndCountAll({
    where,
    include: [
      { model: Member, attributes: ["id", "first_name", "last_name"] },
      {
        model: ClassSession,
        attributes: ["id", "start_time", "end_time", "status"],
        include: [{ model: Class, attributes: ["id", "name"] }],
      },
    ],
    limit,
    offset,
    order: [["booked_at", "DESC"]],
  });
  return { bookings: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const booking = await Booking.forStudio(studioId).findByPk(id, {
    include: [
      { model: Member, attributes: ["id", "first_name", "last_name"] },
      {
        model: ClassSession,
        include: [{ model: Class, attributes: ["id", "name", "max_capacity"] }],
      },
    ],
  });
  if (!booking) throw AppError.notFound("Booking not found");
  return booking;
};

const create = async (studioId, data) => {
  return sequelize.transaction(async (t) => {
    const member = await Member.forStudio(studioId).findByPk(data.memberId, {
      transaction: t,
    });
    if (!member) throw AppError.notFound("Member not found");

    const session = await ClassSession.forStudio(studioId).findByPk(
      data.classSessionId,
      {
        include: [{ model: Class }],
        transaction: t,
        lock: { level: t.LOCK.UPDATE, of: ClassSession },
      },
    );
    if (!session) throw AppError.notFound("Class session not found");

    if (session.status === "cancelled")
      throw AppError.badRequest("Session is cancelled");

    // Check for duplicate booking
    const existing = await Booking.findOne({
      where: {
        member_id: data.memberId,
        class_session_id: data.classSessionId,
      },
      transaction: t,
    });
    if (existing && existing.status !== "cancelled") {
      throw AppError.conflict("Member already booked for this session");
    }

    let status = "confirmed";
    if (session.current_capacity >= session.Class.max_capacity) {
      status = "waitlisted";
    } else {
      await session.increment("current_capacity", { transaction: t });
    }

    const booking = await Booking.create(
      {
        studio_id: studioId,
        member_id: data.memberId,
        class_session_id: data.classSessionId,
        status,
        booked_at: new Date(),
      },
      { transaction: t },
    );

    return booking;
  });
};

const cancel = async (studioId, id) => {
  return sequelize.transaction(async (t) => {
    const booking = await Booking.forStudio(studioId).findByPk(id, {
      include: [{ model: ClassSession }],
      transaction: t,
    });
    if (!booking) throw AppError.notFound("Booking not found");
    if (booking.status === "cancelled")
      throw AppError.badRequest("Booking already cancelled");

    const wasConfirmed = booking.status === "confirmed";
    await booking.update(
      { status: "cancelled", cancelled_at: new Date() },
      { transaction: t },
    );

    if (wasConfirmed) {
      await booking.ClassSession.decrement("current_capacity", {
        transaction: t,
      });

      // Promote first waitlisted booking
      const waitlisted = await Booking.findOne({
        where: {
          class_session_id: booking.class_session_id,
          status: "waitlisted",
        },
        order: [["booked_at", "ASC"]],
        transaction: t,
      });
      if (waitlisted) {
        await waitlisted.update({ status: "confirmed" }, { transaction: t });
        await booking.ClassSession.increment("current_capacity", {
          transaction: t,
        });
      }
    }

    return booking;
  });
};

const remove = async (studioId, id) => {
  const booking = await Booking.forStudio(studioId).findByPk(id);
  if (!booking) throw AppError.notFound("Booking not found");
  await booking.destroy();
};

module.exports = { list, getById, create, cancel, remove };
