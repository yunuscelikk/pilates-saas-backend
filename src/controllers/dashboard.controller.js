const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const dashboardService = require("../services/dashboard.service");

const getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getStats(req.studioId);
  success(res, stats);
});

const getAdvancedStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getAdvancedStats(req.studioId);
  success(res, stats);
});

module.exports = { getStats, getAdvancedStats };
