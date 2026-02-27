const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const attendanceService = require('../services/attendance.service');

const list = catchAsync(async (req, res) => {
  const { attendances, pagination } = await attendanceService.list(req.studioId, req.query);
  paginated(res, attendances, pagination);
});

const checkIn = catchAsync(async (req, res) => {
  const attendance = await attendanceService.checkIn(req.studioId, req.body);
  created(res, attendance);
});

const checkOut = catchAsync(async (req, res) => {
  const attendance = await attendanceService.checkOut(req.studioId, req.params.id);
  success(res, attendance);
});

module.exports = { list, checkIn, checkOut };
