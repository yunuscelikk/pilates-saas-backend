const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const classSessionService = require('../services/classSession.service');

const list = catchAsync(async (req, res) => {
  const { classSessions, pagination } = await classSessionService.list(req.studioId, req.query);
  paginated(res, classSessions, pagination);
});

const getById = catchAsync(async (req, res) => {
  const session = await classSessionService.getById(req.studioId, req.params.id);
  success(res, session);
});

const create = catchAsync(async (req, res) => {
  const session = await classSessionService.create(req.studioId, req.body);
  created(res, session);
});

const update = catchAsync(async (req, res) => {
  const session = await classSessionService.update(req.studioId, req.params.id, req.body);
  success(res, session);
});

const remove = catchAsync(async (req, res) => {
  await classSessionService.remove(req.studioId, req.params.id);
  success(res, { message: 'Class session deleted' });
});

module.exports = { list, getById, create, update, remove };
