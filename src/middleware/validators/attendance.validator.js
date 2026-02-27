const { body } = require('express-validator');

const checkInRules = [
  body('memberId').isUUID().withMessage('Valid member ID is required'),
  body('classSessionId').isUUID().withMessage('Valid class session ID is required'),
];

module.exports = { checkInRules };
