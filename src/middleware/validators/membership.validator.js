const { body } = require("express-validator");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createMembershipRules = [
  body("memberId")
    .matches(UUID_REGEX)
    .withMessage("Valid member ID is required"),
  body("membershipPlanId")
    .matches(UUID_REGEX)
    .withMessage("Valid membership plan ID is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
];

const updateMembershipRules = [
  body("status").optional().isIn(["active", "expired", "cancelled", "frozen"]),
  body("endDate").optional().isISO8601(),
  body("classesRemaining").optional().isInt({ min: 0 }),
];

module.exports = { createMembershipRules, updateMembershipRules };
