const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/response');
const studioService = require('../services/studio.service');

const getCurrent = catchAsync(async (req, res) => {
  const studio = await studioService.getCurrent(req.studioId);
  success(res, studio);
});

const updateCurrent = catchAsync(async (req, res) => {
  const studio = await studioService.updateCurrent(req.studioId, req.body);
  success(res, studio);
});

module.exports = { getCurrent, updateCurrent };
