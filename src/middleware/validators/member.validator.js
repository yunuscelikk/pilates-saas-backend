const { body } = require('express-validator');

const createMemberRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date required'),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('emergencyContactName').optional().trim(),
  body('emergencyContactPhone').optional().trim(),
  body('notes').optional().trim(),
];

const updateMemberRules = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('emergencyContactName').optional().trim(),
  body('emergencyContactPhone').optional().trim(),
  body('notes').optional().trim(),
  body('isActive').optional().isBoolean(),
];

module.exports = { createMemberRules, updateMemberRules };
