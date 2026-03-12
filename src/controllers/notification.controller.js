const catchAsync = require("../utils/catchAsync");
const { success, created, paginated } = require("../utils/response");
const notificationService = require("../services/notification.service");

const list = catchAsync(async (req, res) => {
  const { notifications, pagination } = await notificationService.list(
    req.studioId,
    req.query,
  );
  paginated(res, notifications, pagination);
});

const markRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markRead(
    req.studioId,
    req.params.id,
  );
  success(res, notification);
});

const markAllRead = catchAsync(async (req, res) => {
  await notificationService.markAllRead(req.studioId, req.user.id);
  success(res, { message: "All notifications marked as read" });
});

const create = catchAsync(async (req, res) => {
  const notification = await notificationService.create(req.studioId, req.body);
  created(res, notification);
});

const remove = catchAsync(async (req, res) => {
  await notificationService.remove(req.studioId, req.params.id);
  success(res, { message: "Notification deleted" });
});

module.exports = { list, markRead, markAllRead, create, remove };
