const { body } = require("express-validator");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createMessageRules = [
  body("senderType")
    .isIn(["user", "member"])
    .withMessage("Valid sender type required"),
  body("senderId").matches(UUID_REGEX).withMessage("Valid sender ID required"),
  body("recipientType")
    .isIn(["user", "member"])
    .withMessage("Valid recipient type required"),
  body("recipientId")
    .matches(UUID_REGEX)
    .withMessage("Valid recipient ID required"),
  body("subject").optional().trim(),
  body("body").trim().notEmpty().withMessage("Message body is required"),
];

module.exports = { createMessageRules };
