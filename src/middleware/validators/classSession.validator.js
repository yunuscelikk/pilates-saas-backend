const { body } = require("express-validator");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createClassSessionRules = [
  body("classId").matches(UUID_REGEX).withMessage("Valid class ID is required"),
  body("trainerId")
    .optional()
    .matches(UUID_REGEX)
    .withMessage("Valid trainer ID required"),
  body("startTime").isISO8601().withMessage("Valid start time is required"),
  body("endTime").isISO8601().withMessage("Valid end time is required"),
  body("notes").optional().trim(),
];

const updateClassSessionRules = [
  body("trainerId").optional().matches(UUID_REGEX),
  body("startTime").optional().isISO8601(),
  body("endTime").optional().isISO8601(),
  body("status")
    .optional()
    .isIn(["scheduled", "in_progress", "completed", "cancelled"]),
  body("notes").optional().trim(),
];

module.exports = { createClassSessionRules, updateClassSessionRules };
