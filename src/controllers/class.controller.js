const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const classService = require('../services/class.service');

const list = catchAsync(async (req, res) => {
  const { classes, pagination } = await classService.list(req.studioId, req.query);
  paginated(res, classes, pagination);
});

const getById = catchAsync(async (req, res) => {
  const cls = await classService.getById(req.studioId, req.params.id);
  success(res, cls);
});

const create = catchAsync(async (req, res) => {
  const cls = await classService.create(req.studioId, req.body);
  created(res, cls);
});

const update = catchAsync(async (req, res) => {
  const cls = await classService.update(req.studioId, req.params.id, req.body);
  success(res, cls);
});

const remove = catchAsync(async (req, res) => {
  await classService.remove(req.studioId, req.params.id);
  success(res, { message: 'Class deleted' });
});

module.exports = { list, getById, create, update, remove };
