const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const validate = require('../middleware/validate');
const { checkInRules } = require('../middleware/validators/attendance.validator');

/**
 * @swagger
 * /attendances:
 *   get:
 *     tags: [Attendances]
 *     summary: List attendances
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: classSessionId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paginated attendance list
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
 *                     $ref: '#/components/schemas/Attendance'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', attendanceController.list);

/**
 * @swagger
 * /attendances/check-in:
 *   post:
 *     tags: [Attendances]
 *     summary: Check in a member
 *     description: Records a member check-in for a class session. If the member has an active class_pack membership, decrements classes_remaining.
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
 *         description: Check-in recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: No classes remaining or invalid request
 *       404:
 *         description: Member or class session not found
 *       409:
 *         description: Already checked in
 */
router.post('/check-in', validate(checkInRules), attendanceController.checkIn);

/**
 * @swagger
 * /attendances/{id}/check-out:
 *   patch:
 *     tags: [Attendances]
 *     summary: Check out a member
 *     description: Records check-out time for an existing attendance record.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Check-out recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Already checked out
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/check-out', attendanceController.checkOut);

module.exports = router;
