const { body } = require('express-validator');

const createClassRules = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('description').optional().trim(),
  body('durationMinutes').optional().isInt({ min: 1 }).withMessage('Duration must be positive'),
  body('maxCapacity').optional().isInt({ min: 1 }).withMessage('Capacity must be positive'),
  body('classType').optional().isIn(['group', 'private', 'semi_private']),
];

const updateClassRules = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('durationMinutes').optional().isInt({ min: 1 }),
  body('maxCapacity').optional().isInt({ min: 1 }),
  body('classType').optional().isIn(['group', 'private', 'semi_private']),
  body('isActive').optional().isBoolean(),
];

module.exports = { createClassRules, updateClassRules };
