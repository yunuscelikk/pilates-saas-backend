const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const userService = require('../services/user.service');

const list = catchAsync(async (req, res) => {
  const { users, pagination } = await userService.list(req.studioId, req.query);
  paginated(res, users, pagination);
});

const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.studioId, req.params.id);
  success(res, user);
});

const create = catchAsync(async (req, res) => {
  const user = await userService.create(req.studioId, req.body);
  created(res, user);
});

const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.studioId, req.params.id, req.body);
  success(res, user);
});

const remove = catchAsync(async (req, res) => {
  await userService.remove(req.studioId, req.params.id, req.user.id);
  success(res, { message: 'User deleted' });
});

module.exports = { list, getById, create, update, remove };
