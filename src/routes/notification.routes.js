const router = require("express").Router();
const notificationController = require("../controllers/notification.controller");
const { authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createNotificationRules,
} = require("../middleware/validators/notification.validator");

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, reminder, system]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paginated notification list
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
 *                     $ref: '#/components/schemas/Notification'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get("/", notificationController.list);
router.post(
  "/",
  validate(createNotificationRules),
  notificationController.create,
);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications for the current user as read.
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", notificationController.markAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/read", notificationController.markRead);
router.delete("/:id", authorize("owner"), notificationController.remove);

module.exports = router;
