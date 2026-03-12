const router = require("express").Router();
const paymentController = require("../controllers/payment.controller");
const { authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createPaymentRules,
} = require("../middleware/validators/payment.validator");

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: List payments
 *     description: Returns a paginated list of payments. Supports date range and member filtering.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Payment date range start
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Payment date range end
 *     responses:
 *       200:
 *         description: Paginated payment list
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
 *                     $ref: '#/components/schemas/Payment'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Payments]
 *     summary: Record a payment
 *     description: Creates an immutable payment record. Payments cannot be updated or deleted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId, amount, paymentMethod, paymentDate]
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *               membershipId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional link to a membership
 *               amount:
 *                 type: number
 *                 example: 2500
 *               currency:
 *                 type: string
 *                 example: TRY
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, other]
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Member or membership not found
 */
router.get("/", paymentController.list);
router.post("/", validate(createPaymentRules), paymentController.create);

router.get("/stats", paymentController.getStats);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", paymentController.getById);
router.delete("/:id", authorize("owner"), paymentController.remove);

module.exports = router;
