const { Op } = require("sequelize");
const { Payment, Member, Membership } = require("../models");
const AppError = require("../utils/AppError");
const { getPagination, formatPagination } = require("../utils/pagination");

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.memberId) where.member_id = query.memberId;
  if (query.status) where.status = query.status;
  if (query.startDate && query.endDate) {
    where.payment_date = { [Op.between]: [query.startDate, query.endDate] };
  }

  const { count, rows } = await Payment.forStudio(studioId).findAndCountAll({
    where,
    include: [
      { model: Member, attributes: ["id", "first_name", "last_name"] },
      { model: Membership, attributes: ["id", "status"], required: false },
    ],
    limit,
    offset,
    order: [["payment_date", "DESC"]],
  });
  return { payments: rows, pagination: formatPagination(count, page, limit) };
};

const getById = async (studioId, id) => {
  const payment = await Payment.forStudio(studioId).findByPk(id, {
    include: [
      { model: Member, attributes: ["id", "first_name", "last_name"] },
      { model: Membership, required: false },
    ],
  });
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
};

const create = async (studioId, data) => {
  const member = await Member.forStudio(studioId).findByPk(data.memberId);
  if (!member) throw AppError.notFound("Member not found");

  if (data.membershipId) {
    const membership = await Membership.forStudio(studioId).findByPk(
      data.membershipId,
    );
    if (!membership) throw AppError.notFound("Membership not found");
  }

  return Payment.create({
    studio_id: studioId,
    member_id: data.memberId,
    membership_id: data.membershipId,
    amount: data.amount,
    currency: data.currency,
    payment_method: data.paymentMethod,
    payment_date: data.paymentDate,
    notes: data.notes,
  });
};

const remove = async (studioId, id) => {
  const payment = await getById(studioId, id);
  await payment.destroy();
};

module.exports = { list, getById, create, remove };
