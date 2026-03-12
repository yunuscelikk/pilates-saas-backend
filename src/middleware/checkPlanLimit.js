const { Member, Class, User } = require("../models");
const AppError = require("../utils/AppError");

const RESOURCE_MODELS = {
  members: { model: Member, label: "üye" },
  classes: { model: Class, label: "ders" },
  staff: { model: User, label: "personel" },
};

const LIMIT_FIELDS = {
  members: "max_members",
  classes: "max_classes",
  staff: "max_staff",
};

const checkPlanLimit = (resource) => {
  return async (req, res, next) => {
    try {
      const plan = req.plan;
      if (!plan) {
        return next(AppError.forbidden("Plan bilgisi bulunamadı."));
      }

      const limitField = LIMIT_FIELDS[resource];
      const limit = plan[limitField];

      // null = unlimited
      if (limit === null || limit === undefined) {
        return next();
      }

      const { model, label } = RESOURCE_MODELS[resource];
      let count;

      if (resource === "staff") {
        // Count staff users (non-owner roles) for the studio
        count = await model.count({
          where: {
            studio_id: req.studioId,
            role: ["admin", "staff"],
          },
        });
      } else {
        count = await model.count({
          where: { studio_id: req.studioId },
        });
      }

      if (count >= limit) {
        return next(
          AppError.forbidden(
            `Plan limitinize ulaştınız (${limit} ${label}). Daha fazla ${label} eklemek için planınızı yükseltin.`,
          ),
        );
      }

      next();
    } catch (error) {
      if (error.isOperational) return next(error);
      next(AppError.forbidden("Plan limiti kontrol edilemedi."));
    }
  };
};

module.exports = checkPlanLimit;
