const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const messageService = require('../services/message.service');

const list = catchAsync(async (req, res) => {
  const { messages, pagination } = await messageService.list(req.studioId, req.query);
  paginated(res, messages, pagination);
});

const create = catchAsync(async (req, res) => {
  const message = await messageService.create(req.studioId, req.body);
  created(res, message);
});

const markRead = catchAsync(async (req, res) => {
  const message = await messageService.markRead(req.studioId, req.params.id);
  success(res, message);
});

module.exports = { list, create, markRead };
