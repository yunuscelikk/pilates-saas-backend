const { body } = require("express-validator");

const updateStudioRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),
  body("phone").optional().trim(),
  body("address").optional().trim(),
  body("settings")
    .optional()
    .isObject()
    .withMessage("Settings must be an object"),
];

module.exports = { updateStudioRules };
