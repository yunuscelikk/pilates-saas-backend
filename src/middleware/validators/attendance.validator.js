const { body } = require("express-validator");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const checkInRules = [
  body("memberId")
    .matches(UUID_REGEX)
    .withMessage("Valid member ID is required"),
  body("classSessionId")
    .matches(UUID_REGEX)
    .withMessage("Valid class session ID is required"),
];

module.exports = { checkInRules };
