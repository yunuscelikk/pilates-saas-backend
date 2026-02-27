const router = require('express').Router();
const messageController = require('../controllers/message.controller');
const validate = require('../middleware/validate');
const { createMessageRules } = require('../middleware/validators/message.validator');

/**
 * @swagger
 * /messages:
 *   get:
 *     tags: [Messages]
 *     summary: List messages
 *     description: Returns messages with optional filtering by sender or recipient.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: senderType
 *         schema:
 *           type: string
 *           enum: [user, member]
 *       - in: query
 *         name: senderId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: recipientType
 *         schema:
 *           type: string
 *           enum: [user, member]
 *       - in: query
 *         name: recipientId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paginated message list
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
 *                     $ref: '#/components/schemas/Message'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Messages]
 *     summary: Send a message
 *     description: Creates a new message with polymorphic sender/recipient (user or member).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderType, senderId, recipientType, recipientId, body]
 *             properties:
 *               senderType:
 *                 type: string
 *                 enum: [user, member]
 *               senderId:
 *                 type: string
 *                 format: uuid
 *               recipientType:
 *                 type: string
 *                 enum: [user, member]
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/', messageController.list);
router.post('/', validate(createMessageRules), messageController.create);

/**
 * @swagger
 * /messages/{id}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark a message as read
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Message marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/read', messageController.markRead);

module.exports = router;
