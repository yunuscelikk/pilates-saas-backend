const {
  Plan,
  Subscription,
  Studio,
  Member,
  Class,
  User,
} = require("../models");
const AppError = require("../utils/AppError");
const config = require("../config/app.config");
const iyzico = require("../utils/iyzico");

const TRIAL_DAYS = config.trialDays;

const createTrialSubscription = async (studioId, transaction) => {
  const starterPlan = await Plan.findOne({
    where: { slug: "starter", is_active: true },
    ...(transaction && { transaction }),
  });

  if (!starterPlan) {
    throw AppError.badRequest("Default plan not found");
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  return Subscription.create(
    {
      studio_id: studioId,
      plan_id: starterPlan.id,
      status: "trialing",
      trial_ends_at: trialEndsAt,
    },
    { ...(transaction && { transaction }) },
  );
};

const getPlans = async () => {
  return Plan.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"]],
    attributes: {
      exclude: [
        "iyzico_product_reference_code",
        "iyzico_pricing_plan_reference_code",
      ],
    },
  });
};

const getCurrentSubscription = async (studioId) => {
  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
    include: [{ model: Plan }],
  });

  if (!subscription) {
    throw AppError.notFound("Subscription not found");
  }

  return subscription;
};

const initializeCheckout = async (studioId, planId, customerData) => {
  const plan = await Plan.findByPk(planId);
  if (!plan || !plan.is_active) {
    throw AppError.notFound("Plan not found");
  }

  if (!plan.iyzico_pricing_plan_reference_code) {
    throw AppError.badRequest("Plan is not configured for payments yet");
  }

  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
  });
  if (!subscription) {
    throw AppError.notFound("Subscription not found");
  }

  if (
    !customerData.name ||
    !customerData.surname ||
    !customerData.email ||
    !customerData.gsmNumber ||
    !customerData.identityNumber ||
    !customerData.address
  ) {
    throw AppError.badRequest(
      "Tüm müşteri bilgileri (ad, soyad, e-posta, telefon, TC kimlik, adres) zorunludur.",
    );
  }

  const callbackUrl = `${config.frontendUrl}/api/subscription/callback`;

  let result;
  try {
    result = await iyzico.initializeCheckoutForm({
      pricingPlanRefCode: plan.iyzico_pricing_plan_reference_code,
      customer: {
        name: customerData.name,
        surname: customerData.surname,
        email: customerData.email,
        gsmNumber: customerData.gsmNumber,
        identityNumber: customerData.identityNumber,
        address: customerData.address,
        city: customerData.city,
        country: customerData.country,
      },
      callbackUrl,
      subscriptionInitialStatus: "ACTIVE",
    });
  } catch (err) {
    throw AppError.badRequest(err.message || "Ödeme başlatılamadı.");
  }

  return {
    checkoutFormContent: result.checkoutFormContent,
    token: result.token,
  };
};

const handleCheckoutCallback = async (token, studioId) => {
  const result = await iyzico.retrieveCheckoutFormResult(token);

  const data = result.data || result;
  const subStatus = data.subscriptionStatus;

  if (subStatus !== "ACTIVE" && subStatus !== "PENDING") {
    const msg =
      data.errorMessage || "Ödeme başarısız oldu. Lütfen tekrar deneyin.";
    throw AppError.badRequest(msg);
  }

  // iyzico checkout form retrieve returns 'referenceCode' for subscription ref
  const subscriptionRefCode =
    data.subscriptionReferenceCode || data.referenceCode;

  // Find subscription by studioId (reliable) or fallback to iyzico reference
  let sub = await Subscription.findOne({
    where: { studio_id: studioId },
  });

  if (!sub) {
    sub = await Subscription.findOne({
      where: { iyzico_customer_reference_code: data.customerReferenceCode },
    });
  }

  if (!sub) {
    throw AppError.notFound("Subscription not found for this checkout");
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Find the correct plan by iyzico pricing plan reference
  const plan = await Plan.findOne({
    where: {
      iyzico_pricing_plan_reference_code: data.pricingPlanReferenceCode,
    },
  });

  await sub.update({
    status: "active",
    plan_id: plan ? plan.id : sub.plan_id,
    iyzico_customer_reference_code: data.customerReferenceCode,
    iyzico_subscription_reference_code: subscriptionRefCode,
    iyzico_parent_reference_code: data.parentReferenceCode || null,
    current_period_start: now,
    current_period_end: periodEnd,
    trial_ends_at: null,
  });

  return sub.reload({ include: [{ model: Plan }] });
};

const cancelSubscription = async (studioId) => {
  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
    include: [{ model: Plan }],
  });

  if (!subscription) {
    throw AppError.notFound("Subscription not found");
  }

  if (subscription.status === "canceled" || subscription.status === "expired") {
    throw AppError.badRequest("Abonelik zaten iptal edilmiş.");
  }

  // If there's an active iyzico subscription, cancel it on iyzico side
  if (subscription.iyzico_subscription_reference_code) {
    try {
      await iyzico.cancelSubscription(
        subscription.iyzico_subscription_reference_code,
      );
    } catch (err) {
      // iyzico already canceled or not found — proceed with local cancel
      console.error("[cancelSubscription] iyzico cancel error:", err.message);
    }
  }

  const updateData = {
    canceled_at: new Date(),
  };

  // Paid subscription: keep access until period end
  if (subscription.current_period_end && subscription.status === "active") {
    updateData.status = "canceled";
    updateData.cancel_at_period_end = true;
  } else {
    // Trialing or no period: cancel immediately
    updateData.status = "canceled";
    updateData.cancel_at_period_end = false;
  }

  await subscription.update(updateData);

  return subscription.reload({ include: [{ model: Plan }] });
};

const upgradeSubscription = async (studioId, newPlanId) => {
  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
    include: [{ model: Plan }],
  });

  if (!subscription) {
    throw AppError.notFound("Subscription not found");
  }

  if (subscription.status === "expired") {
    throw AppError.badRequest(
      "Aboneliğiniz sona ermiş. Lütfen yeni bir abonelik başlatın.",
    );
  }

  const newPlan = await Plan.findByPk(newPlanId);
  if (!newPlan || !newPlan.is_active) {
    throw AppError.notFound("Target plan not found");
  }

  if (subscription.plan_id === newPlanId) {
    throw AppError.badRequest("Zaten bu plandansınız.");
  }

  if (!newPlan.iyzico_pricing_plan_reference_code) {
    throw AppError.badRequest("Target plan is not configured for payments");
  }

  // If trialing (no iyzico subscription yet), just update the plan
  if (
    subscription.status === "trialing" ||
    !subscription.iyzico_subscription_reference_code
  ) {
    await subscription.update({ plan_id: newPlanId });
    return subscription.reload({ include: [{ model: Plan }] });
  }

  // Active/past_due subscription - upgrade via iyzico
  try {
    await iyzico.upgradeSubscription(
      subscription.iyzico_subscription_reference_code,
      newPlan.iyzico_pricing_plan_reference_code,
      "NEXT_PERIOD",
    );
  } catch (err) {
    throw AppError.badRequest(err.message || "Plan değişikliği yapılamadı.");
  }

  await subscription.update({ plan_id: newPlanId });
  return subscription.reload({ include: [{ model: Plan }] });
};

const retryPayment = async (studioId) => {
  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
    include: [{ model: Plan }],
  });

  if (!subscription) {
    throw AppError.notFound("Subscription not found");
  }

  if (subscription.status !== "past_due") {
    throw AppError.badRequest(
      "Ödeme tekrarı yalnızca gecikmiş ödemeler için yapılabilir.",
    );
  }

  if (!subscription.iyzico_subscription_reference_code) {
    throw AppError.badRequest("iyzico abonelik referansı bulunamadı.");
  }

  try {
    await iyzico.retryPayment(subscription.iyzico_subscription_reference_code);
  } catch (err) {
    throw AppError.badRequest(err.message || "Ödeme tekrarlanamadı.");
  }

  return subscription.reload({ include: [{ model: Plan }] });
};

const reactivateSubscription = async (studioId, planId, customerData) => {
  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
  });

  if (!subscription) {
    throw AppError.notFound("Subscription not found");
  }

  if (subscription.status !== "canceled" && subscription.status !== "expired") {
    throw AppError.badRequest("Abonelik zaten aktif.");
  }

  // Clear old iyzico references so a fresh subscription is created
  await subscription.update({
    iyzico_subscription_reference_code: null,
    iyzico_customer_reference_code: null,
    iyzico_parent_reference_code: null,
    cancel_at_period_end: false,
    canceled_at: null,
  });

  return initializeCheckout(studioId, planId, customerData);
};

const handleWebhookEvent = async (body, signature) => {
  const {
    iyziEventType,
    subscriptionReferenceCode,
    orderReferenceCode,
    customerReferenceCode,
  } = body;

  // Verify webhook signature
  const isValid = iyzico.verifyWebhookSignature(
    config.iyzico.secretKey,
    iyziEventType,
    subscriptionReferenceCode || "",
    orderReferenceCode || "",
    customerReferenceCode || "",
    signature,
  );

  if (!isValid) {
    throw AppError.unauthorized("Invalid webhook signature");
  }

  console.log(
    `[webhook] event=${iyziEventType} sub=${subscriptionReferenceCode || "-"}`,
  );

  switch (iyziEventType) {
    case "subscription.order.success":
      await handlePaymentSuccess(subscriptionReferenceCode);
      break;
    case "subscription.order.failure":
      await handlePaymentFailure(subscriptionReferenceCode);
      break;
    case "subscription.cancel":
      await handleSubscriptionCanceled(subscriptionReferenceCode);
      break;
    case "subscription.renewed":
      await handlePaymentSuccess(subscriptionReferenceCode);
      break;
    case "subscription.upgraded":
      // Plan change is handled in upgradeSubscription; webhook confirms it
      console.log(
        `[webhook] subscription upgraded: ${subscriptionReferenceCode}`,
      );
      break;
    default:
      console.log(`[webhook] unhandled event: ${iyziEventType}`);
  }
};

const handlePaymentSuccess = async (subscriptionReferenceCode) => {
  if (!subscriptionReferenceCode) return;

  const subscription = await Subscription.findOne({
    where: { iyzico_subscription_reference_code: subscriptionReferenceCode },
  });

  if (!subscription) return;

  // Already active with a future period end — idempotent guard
  if (
    subscription.status === "active" &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) > new Date()
  ) {
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await subscription.update({
    status: "active",
    current_period_start: now,
    current_period_end: periodEnd,
    cancel_at_period_end: false,
    canceled_at: null,
  });
};

const handlePaymentFailure = async (subscriptionReferenceCode) => {
  if (!subscriptionReferenceCode) return;

  const subscription = await Subscription.findOne({
    where: { iyzico_subscription_reference_code: subscriptionReferenceCode },
  });

  if (!subscription) return;

  // Only transition active → past_due, not already past_due/canceled
  if (subscription.status === "active") {
    await subscription.update({ status: "past_due" });
  }
};

const handleSubscriptionCanceled = async (subscriptionReferenceCode) => {
  if (!subscriptionReferenceCode) return;

  const subscription = await Subscription.findOne({
    where: { iyzico_subscription_reference_code: subscriptionReferenceCode },
  });

  if (!subscription) return;

  // If already canceled locally, skip
  if (subscription.status === "canceled" || subscription.status === "expired") {
    return;
  }

  await subscription.update({
    status: "canceled",
    canceled_at: new Date(),
    cancel_at_period_end: !!subscription.current_period_end,
  });
};

const getPlanUsage = async (studioId) => {
  const subscription = await Subscription.findOne({
    where: { studio_id: studioId },
    include: [{ model: Plan }],
  });

  if (!subscription || !subscription.Plan) {
    throw AppError.notFound("Subscription not found");
  }

  const plan = subscription.Plan;

  const [memberCount, classCount, staffCount] = await Promise.all([
    Member.count({ where: { studio_id: studioId } }),
    Class.count({ where: { studio_id: studioId } }),
    User.count({
      where: { studio_id: studioId, role: ["admin", "staff"] },
    }),
  ]);

  return {
    limits: {
      max_members: plan.max_members,
      max_classes: plan.max_classes,
      max_staff: plan.max_staff,
    },
    usage: {
      members: memberCount,
      classes: classCount,
      staff: staffCount,
    },
    features: plan.features || {},
    plan: {
      name: plan.name,
      slug: plan.slug,
    },
  };
};

module.exports = {
  createTrialSubscription,
  getPlans,
  getCurrentSubscription,
  getPlanUsage,
  initializeCheckout,
  handleCheckoutCallback,
  cancelSubscription,
  upgradeSubscription,
  retryPayment,
  reactivateSubscription,
  handleWebhookEvent,
};
