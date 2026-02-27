const { body } = require('express-validator');

const createTrainerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('specializations').optional().isArray(),
  body('bio').optional().trim(),
];

const updateTrainerRules = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('specializations').optional().isArray(),
  body('bio').optional().trim(),
  body('isActive').optional().isBoolean(),
];

module.exports = { createTrainerRules, updateTrainerRules };
