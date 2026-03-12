const { body } = require("express-validator");

const registerRules = [
  body("studioName").optional().trim(),
  body("studioSlug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase alphanumeric with hyphens"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
];

const loginRules = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("studioSlug").optional().trim(),
];

const refreshRules = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

module.exports = { registerRules, loginRules, refreshRules };
