const { Router } = require("express");
const webhookController = require("../controllers/webhook.controller");

const router = Router();

// Public - iyzico webhook (no auth required)
router.post("/iyzico", webhookController.handleIyzicoWebhook);

module.exports = router;
