const { Subscription, Plan } = require("../models");
const AppError = require("../utils/AppError");

const GRACE_PERIOD_DAYS = 3;

const checkSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { studio_id: req.studioId },
      include: [{ model: Plan }],
    });

    if (!subscription) {
      console.log(
        "[checkSubscription] No subscription found for studio:",
        req.studioId,
      );
      return next(
        AppError.forbidden(
          "Aktif abonelik bulunamadı. Lütfen bir plana abone olun.",
        ),
      );
    }

    const now = new Date();

    switch (subscription.status) {
      case "trialing": {
        if (
          subscription.trial_ends_at &&
          new Date(subscription.trial_ends_at) < now
        ) {
          await subscription.update({ status: "expired" });
          return next(
            AppError.forbidden(
              "Deneme süreniz sona erdi. Devam etmek için bir plan seçin.",
            ),
          );
        }
        break;
      }

      case "active":
        break;

      case "past_due": {
        if (subscription.current_period_end) {
          const graceDeadline = new Date(subscription.current_period_end);
          graceDeadline.setDate(graceDeadline.getDate() + GRACE_PERIOD_DAYS);
          if (now > graceDeadline) {
            await subscription.update({ status: "expired" });
            return next(
              AppError.forbidden(
                "Ödeme süresi doldu. Devam etmek için ödemenizi güncelleyin.",
              ),
            );
          }
        }
        break;
      }

      case "canceled": {
        // cancel_at_period_end: dönem sonuna kadar erişim devam eder
        if (
          subscription.cancel_at_period_end &&
          subscription.current_period_end &&
          new Date(subscription.current_period_end) > now
        ) {
          break;
        }
        return next(
          AppError.forbidden(
            "Aboneliğiniz sona erdi. Devam etmek için bir plan seçin.",
          ),
        );
      }

      case "expired":
        return next(
          AppError.forbidden(
            "Aboneliğiniz sona erdi. Devam etmek için bir plan seçin.",
          ),
        );

      default:
        return next(AppError.forbidden("Geçersiz abonelik durumu."));
    }

    req.subscription = subscription;
    req.plan = subscription.Plan;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(AppError.forbidden("Abonelik doğrulanamadı."));
  }
};

module.exports = checkSubscription;
