const { body } = require("express-validator");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createPaymentRules = [
  body("memberId")
    .matches(UUID_REGEX)
    .withMessage("Valid member ID is required"),
  body("membershipId").optional().matches(UUID_REGEX),
  body("amount").isFloat({ min: 0 }).withMessage("Amount is required"),
  body("currency").optional().isLength({ min: 3, max: 3 }),
  body("paymentMethod")
    .isIn(["cash", "credit_card", "bank_transfer", "other"])
    .withMessage("Valid payment method required"),
  body("paymentDate").isISO8601().withMessage("Valid payment date required"),
  body("notes").optional().trim(),
];

module.exports = { createPaymentRules };
