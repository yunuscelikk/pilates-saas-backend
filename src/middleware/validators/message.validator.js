const { body } = require('express-validator');

const createMessageRules = [
  body('senderType').isIn(['user', 'member']).withMessage('Valid sender type required'),
  body('senderId').isUUID().withMessage('Valid sender ID required'),
  body('recipientType').isIn(['user', 'member']).withMessage('Valid recipient type required'),
  body('recipientId').isUUID().withMessage('Valid recipient ID required'),
  body('subject').optional().trim(),
  body('body').trim().notEmpty().withMessage('Message body is required'),
];

module.exports = { createMessageRules };
