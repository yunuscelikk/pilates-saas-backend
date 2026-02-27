const router = require('express').Router();
const classSessionController = require('../controllers/classSession.controller');
const validate = require('../middleware/validate');
const { createClassSessionRules, updateClassSessionRules } = require('../middleware/validators/classSession.validator');

/**
 * @swagger
 * /class-sessions:
 *   get:
 *     tags: [ClassSessions]
 *     summary: List class sessions
 *     description: Returns scheduled class sessions. Supports date range filtering.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sessions starting from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sessions until this date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: trainerId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paginated class session list
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
 *                     $ref: '#/components/schemas/ClassSession'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [ClassSessions]
 *     summary: Create a new class session
 *     description: Schedules a new class session. Validates that classId and trainerId belong to the same studio.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [classId, startTime, endTime]
 *             properties:
 *               classId:
 *                 type: string
 *                 format: uuid
 *               trainerId:
 *                 type: string
 *                 format: uuid
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClassSession'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Class or trainer not found in this studio
 */
router.get('/', classSessionController.list);
router.post('/', validate(createClassSessionRules), classSessionController.create);

/**
 * @swagger
 * /class-sessions/{id}:
 *   get:
 *     tags: [ClassSessions]
 *     summary: Get class session by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Class session details with class and trainer info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClassSession'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [ClassSessions]
 *     summary: Update class session
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerId:
 *                 type: string
 *                 format: uuid
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [scheduled, in_progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class session updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [ClassSessions]
 *     summary: Delete class session
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Class session deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', classSessionController.getById);
router.put('/:id', validate(updateClassSessionRules), classSessionController.update);
router.delete('/:id', classSessionController.remove);

module.exports = router;
