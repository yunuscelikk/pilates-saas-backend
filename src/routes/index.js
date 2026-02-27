const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

// Public routes
router.use('/auth', require('./auth.routes'));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns the server status and current timestamp.
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Protected routes - all require authentication
router.use(authenticate);

router.use('/studios', require('./studio.routes'));
router.use('/users', require('./user.routes'));
router.use('/members', require('./member.routes'));
router.use('/trainers', require('./trainer.routes'));
router.use('/classes', require('./class.routes'));
router.use('/class-sessions', require('./classSession.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/membership-plans', require('./membershipPlan.routes'));
router.use('/memberships', require('./membership.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/attendances', require('./attendance.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/messages', require('./message.routes'));

module.exports = router;
