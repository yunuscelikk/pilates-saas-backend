const { Studio } = require('../models');
const AppError = require('../utils/AppError');

const resolveStudio = async (req, res, next) => {
  try {
    const { studioSlug } = req.params;
    if (!studioSlug) {
      throw AppError.badRequest('Studio slug is required');
    }

    const studio = await Studio.findOne({
      where: { slug: studioSlug, is_active: true },
    });

    if (!studio) {
      throw AppError.notFound('Studio not found');
    }

    req.studio = studio;
    req.studioId = studio.id;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(AppError.notFound('Studio not found'));
  }
};

module.exports = resolveStudio;
