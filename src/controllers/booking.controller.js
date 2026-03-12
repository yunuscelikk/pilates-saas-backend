const catchAsync = require("../utils/catchAsync");
const { success, created, paginated } = require("../utils/response");
const bookingService = require("../services/booking.service");
const bookingStatsService = require("../services/bookingStats.service");

const list = catchAsync(async (req, res) => {
  const { bookings, pagination } = await bookingService.list(
    req.studioId,
    req.query,
  );
  paginated(res, bookings, pagination);
});

const getById = catchAsync(async (req, res) => {
  const booking = await bookingService.getById(req.studioId, req.params.id);
  success(res, booking);
});

const create = catchAsync(async (req, res) => {
  const booking = await bookingService.create(req.studioId, req.body);
  created(res, booking);
});

const cancel = catchAsync(async (req, res) => {
  const booking = await bookingService.cancel(req.studioId, req.params.id);
  success(res, booking);
});

const remove = catchAsync(async (req, res) => {
  await bookingService.remove(req.studioId, req.params.id);
  success(res, { message: "Booking deleted" });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await bookingStatsService.getStats(req.studioId);
  success(res, stats);
});

module.exports = { list, getById, create, cancel, remove, getStats };
