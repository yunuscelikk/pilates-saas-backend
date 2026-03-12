const catchAsync = require("../utils/catchAsync");
const { success, created, paginated } = require("../utils/response");
const membershipService = require("../services/membership.service");
const membershipStatsService = require("../services/membershipStats.service");

const list = catchAsync(async (req, res) => {
  const { memberships, pagination } = await membershipService.list(
    req.studioId,
    req.query,
  );
  paginated(res, memberships, pagination);
});

const getById = catchAsync(async (req, res) => {
  const membership = await membershipService.getById(
    req.studioId,
    req.params.id,
  );
  success(res, membership);
});

const create = catchAsync(async (req, res) => {
  const membership = await membershipService.create(req.studioId, req.body);
  created(res, membership);
});

const update = catchAsync(async (req, res) => {
  const membership = await membershipService.update(
    req.studioId,
    req.params.id,
    req.body,
  );
  success(res, membership);
});

const freeze = catchAsync(async (req, res) => {
  const membership = await membershipService.freeze(
    req.studioId,
    req.params.id,
  );
  success(res, membership);
});

const activate = catchAsync(async (req, res) => {
  const membership = await membershipService.activate(
    req.studioId,
    req.params.id,
  );
  success(res, membership);
});

const remove = catchAsync(async (req, res) => {
  await membershipService.remove(req.studioId, req.params.id);
  success(res, { message: "Membership deleted" });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await membershipStatsService.getStats(req.studioId);
  success(res, stats);
});

module.exports = {
  list,
  getById,
  create,
  update,
  freeze,
  activate,
  remove,
  getStats,
};
