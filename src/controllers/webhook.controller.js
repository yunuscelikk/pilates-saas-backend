const catchAsync = require("../utils/catchAsync");
const subscriptionService = require("../services/subscription.service");

const handleIyzicoWebhook = catchAsync(async (req, res) => {
  const signature = req.headers["x-iyz-signature-v3"];

  if (!signature) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing signature" });
  }

  try {
    await subscriptionService.handleWebhookEvent(req.body, signature);
  } catch (err) {
    console.error("[webhook] processing error:", err.message);
    // Still return 200 to prevent iyzico from retrying on our validation errors
    if (err.statusCode === 401) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid signature" });
    }
  }

  // iyzico expects 200 response
  res.status(200).json({ status: "ok" });
});

module.exports = { handleIyzicoWebhook };
