const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const subscriptionService = require("../services/subscription.service");

const getPlans = catchAsync(async (req, res) => {
  const plans = await subscriptionService.getPlans();
  success(res, plans);
});

const getCurrentSubscription = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.getCurrentSubscription(
    req.studioId,
  );
  success(res, subscription);
});

const initializeCheckout = catchAsync(async (req, res) => {
  const result = await subscriptionService.initializeCheckout(
    req.studioId,
    req.body.planId,
    req.body.customer,
  );
  success(res, result);
});

const handleCheckoutCallback = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.handleCheckoutCallback(
    req.body.token,
    req.studioId,
  );
  success(res, subscription);
});

const cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(
    req.studioId,
  );
  success(res, subscription);
});

const upgradeSubscription = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.upgradeSubscription(
    req.studioId,
    req.body.planId,
  );
  success(res, subscription);
});

const retryPayment = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.retryPayment(req.studioId);
  success(res, subscription);
});

const reactivateSubscription = catchAsync(async (req, res) => {
  const result = await subscriptionService.reactivateSubscription(
    req.studioId,
    req.body.planId,
    req.body.customer,
  );
  success(res, result);
});

const getPlanUsage = catchAsync(async (req, res) => {
  const usage = await subscriptionService.getPlanUsage(req.studioId);
  success(res, usage);
});

module.exports = {
  getPlans,
  getCurrentSubscription,
  getPlanUsage,
  initializeCheckout,
  handleCheckoutCallback,
  cancelSubscription,
  upgradeSubscription,
  retryPayment,
  reactivateSubscription,
};
