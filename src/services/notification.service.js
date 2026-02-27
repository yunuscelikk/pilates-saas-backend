const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, formatPagination } = require('../utils/pagination');

const list = async (studioId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.isRead !== undefined) where.is_read = query.isRead === 'true';
  if (query.type) where.type = query.type;
  if (query.userId) where.user_id = query.userId;

  const { count, rows } = await Notification.forStudio(studioId).findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  return { notifications: rows, pagination: formatPagination(count, page, limit) };
};

const markRead = async (studioId, id) => {
  const notification = await Notification.forStudio(studioId).findByPk(id);
  if (!notification) throw AppError.notFound('Notification not found');
  await notification.update({ is_read: true, read_at: new Date() });
  return notification;
};

const markAllRead = async (studioId, userId) => {
  await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { studio_id: studioId, user_id: userId, is_read: false } }
  );
};

module.exports = { list, markRead, markAllRead };
