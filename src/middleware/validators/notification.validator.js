const { body } = require('express-validator');

const createNotificationRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('body').optional().trim(),
  body('type').optional().isIn(['info', 'warning', 'reminder', 'system']),
  body('userId').optional().isUUID(),
  body('memberId').optional().isUUID(),
];

module.exports = { createNotificationRules };
