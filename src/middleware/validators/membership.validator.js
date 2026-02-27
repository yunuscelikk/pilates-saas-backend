const { body } = require('express-validator');

const createMembershipRules = [
  body('memberId').isUUID().withMessage('Valid member ID is required'),
  body('membershipPlanId').isUUID().withMessage('Valid membership plan ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
];

const updateMembershipRules = [
  body('status').optional().isIn(['active', 'expired', 'cancelled', 'frozen']),
  body('endDate').optional().isISO8601(),
  body('classesRemaining').optional().isInt({ min: 0 }),
];

module.exports = { createMembershipRules, updateMembershipRules };
