const router = require("express").Router();
const membershipController = require("../controllers/membership.controller");
const { authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createMembershipRules,
  updateMembershipRules,
} = require("../middleware/validators/membership.validator");

/**
 * @swagger
 * /memberships:
 *   get:
 *     tags: [Memberships]
 *     summary: List memberships
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
 *           enum: [active, expired, cancelled, frozen]
 *     responses:
 *       200:
 *         description: Paginated membership list
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
 *                     $ref: '#/components/schemas/Membership'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Memberships]
 *     summary: Create a membership
 *     description: Creates a membership for a member based on a plan. Automatically calculates end_date and classes_remaining from the plan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId, membershipPlanId, startDate]
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *               membershipPlanId:
 *                 type: string
 *                 format: uuid
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: '2026-03-10'
 *     responses:
 *       201:
 *         description: Membership created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Member or plan not found
 */
router.get("/", membershipController.list);
router.get("/stats", membershipController.getStats);
router.post("/", validate(createMembershipRules), membershipController.create);

/**
 * @swagger
 * /memberships/{id}:
 *   get:
 *     tags: [Memberships]
 *     summary: Get membership by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Membership details with member and plan info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Memberships]
 *     summary: Update membership
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, expired, cancelled, frozen]
 *               endDate:
 *                 type: string
 *                 format: date
 *               classesRemaining:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Membership updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Memberships]
 *     summary: Delete membership (soft-delete)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Membership deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", membershipController.getById);
router.put(
  "/:id",
  validate(updateMembershipRules),
  membershipController.update,
);
router.delete("/:id", authorize("owner"), membershipController.remove);

/**
 * @swagger
 * /memberships/{id}/freeze:
 *   patch:
 *     tags: [Memberships]
 *     summary: Freeze a membership
 *     description: Freezes an active membership. Only active memberships can be frozen.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Membership frozen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       400:
 *         description: Only active memberships can be frozen
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/freeze", membershipController.freeze);

/**
 * @swagger
 * /memberships/{id}/activate:
 *   patch:
 *     tags: [Memberships]
 *     summary: Reactivate a frozen membership
 *     description: Reactivates a frozen membership. Only frozen memberships can be activated.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Membership activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       400:
 *         description: Only frozen memberships can be activated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/activate", membershipController.activate);

module.exports = router;
