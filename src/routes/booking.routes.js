const router = require('express').Router();
const bookingController = require('../controllers/booking.controller');
const validate = require('../middleware/validate');
const { createBookingRules } = require('../middleware/validators/booking.validator');

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by member
 *       - in: query
 *         name: classSessionId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class session
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, cancelled, waitlisted, no_show]
 *     responses:
 *       200:
 *         description: Paginated booking list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking
 *     description: Books a member into a class session. Checks capacity — if full, the booking is waitlisted. Uses a transaction to prevent race conditions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId, classSessionId]
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *               classSessionId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Booking created (confirmed or waitlisted)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Session cancelled or invalid request
 *       404:
 *         description: Member or class session not found
 *       409:
 *         description: Member already booked for this session
 */
router.get('/', bookingController.list);
router.post('/', validate(createBookingRules), bookingController.create);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking details with member and session info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', bookingController.getById);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     description: Cancels a confirmed booking and automatically promotes the next waitlisted booking if one exists.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Booking already cancelled
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/cancel', bookingController.cancel);

module.exports = router;
