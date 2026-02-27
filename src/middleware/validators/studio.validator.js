const { body } = require('express-validator');

const updateStudioRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('settings').optional().isObject().withMessage('Settings must be an object'),
];

module.exports = { updateStudioRules };
