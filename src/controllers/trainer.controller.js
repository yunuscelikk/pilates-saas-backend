const catchAsync = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const trainerService = require('../services/trainer.service');

const list = catchAsync(async (req, res) => {
  const { trainers, pagination } = await trainerService.list(req.studioId, req.query);
  paginated(res, trainers, pagination);
});

const getById = catchAsync(async (req, res) => {
  const trainer = await trainerService.getById(req.studioId, req.params.id);
  success(res, trainer);
});

const create = catchAsync(async (req, res) => {
  const trainer = await trainerService.create(req.studioId, req.body);
  created(res, trainer);
});

const update = catchAsync(async (req, res) => {
  const trainer = await trainerService.update(req.studioId, req.params.id, req.body);
  success(res, trainer);
});

const remove = catchAsync(async (req, res) => {
  await trainerService.remove(req.studioId, req.params.id);
  success(res, { message: 'Trainer deleted' });
});

module.exports = { list, getById, create, update, remove };
