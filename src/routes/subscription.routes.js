const { Router } = require("express");
const { authorize } = require("../middleware/auth");
const subscriptionController = require("../controllers/subscription.controller");

const router = Router();

// Public - plan listesi
router.get("/plans", subscriptionController.getPlans);

// Authenticated - mevcut abonelik
router.get("/subscription", subscriptionController.getCurrentSubscription);

// Authenticated - plan kullanım bilgileri
router.get("/subscription/usage", subscriptionController.getPlanUsage);

// Owner only - checkout başlat
router.post(
  "/subscription/checkout",
  authorize("owner"),
  subscriptionController.initializeCheckout,
);

// Authenticated - checkout callback
router.post(
  "/subscription/checkout/callback",
  subscriptionController.handleCheckoutCallback,
);

// Owner only - iptal
router.post(
  "/subscription/cancel",
  authorize("owner"),
  subscriptionController.cancelSubscription,
);

// Owner only - upgrade
router.post(
  "/subscription/upgrade",
  authorize("owner"),
  subscriptionController.upgradeSubscription,
);

// Owner only - retry payment
router.post(
  "/subscription/retry-payment",
  authorize("owner"),
  subscriptionController.retryPayment,
);

// Owner only - reactivate (cancelled/expired)
router.post(
  "/subscription/reactivate",
  authorize("owner"),
  subscriptionController.reactivateSubscription,
);

module.exports = router;
