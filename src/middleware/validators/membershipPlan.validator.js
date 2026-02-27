const { body } = require('express-validator');

const createMembershipPlanRules = [
  body('name').trim().notEmpty().withMessage('Plan name is required'),
  body('description').optional().trim(),
  body('planType').isIn(['class_pack', 'time_based', 'unlimited']).withMessage('Valid plan type required'),
  body('classesIncluded').optional().isInt({ min: 1 }),
  body('durationDays').optional().isInt({ min: 1 }),
  body('price').isFloat({ min: 0 }).withMessage('Price is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }),
];

const updateMembershipPlanRules = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('planType').optional().isIn(['class_pack', 'time_based', 'unlimited']),
  body('classesIncluded').optional().isInt({ min: 1 }),
  body('durationDays').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('isActive').optional().isBoolean(),
];

module.exports = { createMembershipPlanRules, updateMembershipPlanRules };
