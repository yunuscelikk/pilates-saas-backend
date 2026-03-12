const Iyzipay = require("iyzipay");
const crypto = require("crypto");
const config = require("../config/app.config");

const iyzipay = new Iyzipay({
  apiKey: config.iyzico.apiKey,
  secretKey: config.iyzico.secretKey,
  uri: config.iyzico.uri,
});

const promisify = (method, params) => {
  return new Promise((resolve, reject) => {
    method(params, (err, result) => {
      if (err) return reject(err);
      if (result.status === "failure") {
        const error = new Error(result.errorMessage || "iyzico API error");
        error.errorCode = result.errorCode;
        error.errorGroup = result.errorGroup;
        error.rawResult = result;
        return reject(error);
      }
      resolve(result);
    });
  });
};

const createProduct = (name, description) => {
  return promisify(
    iyzipay.subscriptionProduct.create.bind(iyzipay.subscriptionProduct),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      name,
      description,
    },
  );
};

const createPricingPlan = (
  productReferenceCode,
  { name, price, interval, trialDays },
) => {
  const currencyCode = Iyzipay.CURRENCY.TRY;
  const paymentInterval =
    interval === "monthly"
      ? Iyzipay.SUBSCRIPTION_PRICING_PLAN_INTERVAL.MONTHLY
      : Iyzipay.SUBSCRIPTION_PRICING_PLAN_INTERVAL.YEARLY;

  return promisify(
    iyzipay.subscriptionPricingPlan.create.bind(
      iyzipay.subscriptionPricingPlan,
    ),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      productReferenceCode,
      name,
      price,
      currencyCode,
      paymentInterval,
      paymentIntervalCount: 1,
      trialPeriodDays: trialDays || 0,
      planPaymentType: Iyzipay.PLAN_PAYMENT_TYPE.RECURRING,
    },
  );
};

const initializeCheckoutForm = ({
  pricingPlanRefCode,
  customer,
  callbackUrl,
  subscriptionInitialStatus,
}) => {
  return promisify(
    iyzipay.subscriptionCheckoutForm.initialize.bind(
      iyzipay.subscriptionCheckoutForm,
    ),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      pricingPlanReferenceCode: pricingPlanRefCode,
      subscriptionInitialStatus: subscriptionInitialStatus || "ACTIVE",
      callbackUrl,
      customer: {
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        gsmNumber: customer.gsmNumber,
        identityNumber: customer.identityNumber,
        billingAddress: {
          contactName: `${customer.name} ${customer.surname}`,
          city: customer.city || "Istanbul",
          country: customer.country || "Turkey",
          address: customer.address,
        },
        shippingAddress: {
          contactName: `${customer.name} ${customer.surname}`,
          city: customer.city || "Istanbul",
          country: customer.country || "Turkey",
          address: customer.address,
        },
      },
    },
  );
};

const retrieveCheckoutFormResult = (token) => {
  return promisify(
    iyzipay.subscriptionCheckoutForm.retrieve.bind(
      iyzipay.subscriptionCheckoutForm,
    ),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      checkoutFormToken: token,
    },
  );
};

const cancelSubscription = (subscriptionReferenceCode) => {
  return promisify(iyzipay.subscription.cancel.bind(iyzipay.subscription), {
    locale: Iyzipay.LOCALE.TR,
    conversationId: crypto.randomUUID(),
    subscriptionReferenceCode,
  });
};

const upgradeSubscription = (
  subscriptionReferenceCode,
  newPricingPlanReferenceCode,
  upgradePeriod,
) => {
  return promisify(iyzipay.subscription.upgrade.bind(iyzipay.subscription), {
    locale: Iyzipay.LOCALE.TR,
    conversationId: crypto.randomUUID(),
    subscriptionReferenceCode,
    newPricingPlanReferenceCode,
    upgradePeriod: upgradePeriod || "NEXT_PERIOD",
  });
};

const getSubscriptionDetail = (subscriptionReferenceCode) => {
  return promisify(iyzipay.subscription.search.bind(iyzipay.subscription), {
    locale: Iyzipay.LOCALE.TR,
    conversationId: crypto.randomUUID(),
    subscriptionReferenceCode,
    page: 1,
    count: 1,
  });
};

const retryPayment = (referenceCode) => {
  return promisify(
    iyzipay.subscriptionPayment.retry.bind(iyzipay.subscriptionPayment),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      referenceCode,
    },
  );
};

const verifyWebhookSignature = (
  secretKey,
  iyziEventType,
  subscriptionReferenceCode,
  orderReferenceCode,
  customerReferenceCode,
  signature,
) => {
  const payload = [
    secretKey,
    iyziEventType,
    subscriptionReferenceCode,
    orderReferenceCode,
    customerReferenceCode,
  ].join("");

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSignature, "utf8");

  if (sigBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
};

const listProducts = (page = 1, count = 10) => {
  return promisify(
    iyzipay.subscriptionProduct.retrieveList.bind(iyzipay.subscriptionProduct),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      page,
      count,
    },
  );
};

module.exports = {
  iyzipay,
  createProduct,
  listProducts,
  createPricingPlan,
  initializeCheckoutForm,
  retrieveCheckoutFormResult,
  cancelSubscription,
  upgradeSubscription,
  getSubscriptionDetail,
  retryPayment,
  verifyWebhookSignature,
};
