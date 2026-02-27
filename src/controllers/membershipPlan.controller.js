const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const membershipPlanService = require('../services/membershipPlan.service');

const list = catchAsync(async (req, res) => {
  const { membershipPlans, pagination } = await membershipPlanService.list(req.studioId, req.query);
  paginated(res, membershipPlans, pagination);
});

const getById = catchAsync(async (req, res) => {
  const plan = await membershipPlanService.getById(req.studioId, req.params.id);
  success(res, plan);
});

const create = catchAsync(async (req, res) => {
  const plan = await membershipPlanService.create(req.studioId, req.body);
  created(res, plan);
});

const update = catchAsync(async (req, res) => {
  const plan = await membershipPlanService.update(req.studioId, req.params.id, req.body);
  success(res, plan);
});

const remove = catchAsync(async (req, res) => {
  await membershipPlanService.remove(req.studioId, req.params.id);
  success(res, { message: 'Membership plan deleted' });
});

module.exports = { list, getById, create, update, remove };
