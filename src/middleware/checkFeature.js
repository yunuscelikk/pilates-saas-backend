const AppError = require("../utils/AppError");

const FEATURE_LABELS = {
  advanced_reports: "Gelişmiş Raporlama",
  sms_notifications: "SMS Bildirimleri",
  api_access: "API Erişimi",
  custom_branding: "Özel Marka",
};

const checkFeature = (featureKey) => {
  return (req, res, next) => {
    const plan = req.plan;
    if (!plan) {
      return next(AppError.forbidden("Plan bilgisi bulunamadı."));
    }

    const features = plan.features || {};

    if (!features[featureKey]) {
      const label = FEATURE_LABELS[featureKey] || featureKey;
      return next(
        AppError.forbidden(
          `"${label}" özelliği mevcut planınızda bulunmuyor. Bu özelliği kullanmak için planınızı yükseltin.`,
        ),
      );
    }

    next();
  };
};

module.exports = checkFeature;
