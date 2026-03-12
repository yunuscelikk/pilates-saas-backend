const { body } = require("express-validator");

const createNotificationRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("body").optional().trim(),
  body("type").optional().isIn(["info", "warning", "reminder", "system"]),
  body("userId")
    .optional()
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  body("memberId")
    .optional()
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
];

module.exports = { createNotificationRules };
