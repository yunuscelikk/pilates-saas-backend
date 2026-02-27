const { Message } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.recipientType) where.recipient_type = query.recipientType;
  if (query.recipientId) where.recipient_id = query.recipientId;
  if (query.senderType) where.sender_type = query.senderType;
  if (query.senderId) where.sender_id = query.senderId;

  const { count, rows } = await Message.forStudio(studioId).findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { messages: rows, pagination: formatPagination(count, page, limit) };
};

const create = async (studioId, data) => {
  return Message.create({
    studio_id: studioId,
    sender_type: data.senderType,
    sender_id: data.senderId,
    recipient_type: data.recipientType,
    recipient_id: data.recipientId,
    subject: data.subject,
    body: data.body,
  });
};

const markRead = async (studioId, id) => {
  const message = await Message.forStudio(studioId).findByPk(id);
  if (!message) throw AppError.notFound('Message not found');
  await message.update({ is_read: true, read_at: new Date() });
  return message;
};

module.exports = { list, create, markRead };
