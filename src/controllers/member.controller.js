const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const memberService = require('../services/member.service');

const list = catchAsync(async (req, res) => {
  const { members, pagination } = await memberService.list(req.studioId, req.query);
  paginated(res, members, pagination);
});

const getById = catchAsync(async (req, res) => {
  const member = await memberService.getById(req.studioId, req.params.id);
  success(res, member);
});

const create = catchAsync(async (req, res) => {
  const member = await memberService.create(req.studioId, req.body);
  created(res, member);
});

const update = catchAsync(async (req, res) => {
  const member = await memberService.update(req.studioId, req.params.id, req.body);
  success(res, member);
});

const remove = catchAsync(async (req, res) => {
  await memberService.remove(req.studioId, req.params.id);
  success(res, { message: 'Member deleted' });
});

module.exports = { list, getById, create, update, remove };
