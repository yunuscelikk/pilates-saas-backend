const catchAsync = require("../utils/catchAsync");
const { success, created, paginated } = require("../utils/response");
const paymentService = require("../services/payment.service");
const paymentStatsService = require("../services/paymentStats.service");

const list = catchAsync(async (req, res) => {
  const { payments, pagination } = await paymentService.list(
    req.studioId,
    req.query,
  );
  paginated(res, payments, pagination);
});

const getById = catchAsync(async (req, res) => {
  const payment = await paymentService.getById(req.studioId, req.params.id);
  success(res, payment);
});

const create = catchAsync(async (req, res) => {
  const payment = await paymentService.create(req.studioId, req.body);
  created(res, payment);
});

const remove = catchAsync(async (req, res) => {
  await paymentService.remove(req.studioId, req.params.id);
  success(res, { message: "Payment deleted" });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await paymentStatsService.getStats(req.studioId);
  success(res, stats);
});

module.exports = { list, getById, create, remove, getStats };
