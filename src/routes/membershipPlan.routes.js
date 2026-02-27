const router = require('express').Router();
const membershipPlanController = require('../controllers/membershipPlan.controller');
const validate = require('../middleware/validate');
const { createMembershipPlanRules, updateMembershipPlanRules } = require('../middleware/validators/membershipPlan.validator');

/**
 * @swagger
 * /membership-plans:
 *   get:
 *     tags: [MembershipPlans]
 *     summary: List membership plans
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: planType
 *         schema:
 *           type: string
 *           enum: [class_pack, time_based, unlimited]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Paginated membership plan list
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
 *                     $ref: '#/components/schemas/MembershipPlan'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [MembershipPlans]
 *     summary: Create a membership plan
 *     description: Creates a new membership plan. class_pack plans require classesIncluded, time_based plans require durationDays.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, planType, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 10 Class Pack
 *               description:
 *                 type: string
 *               planType:
 *                 type: string
 *                 enum: [class_pack, time_based, unlimited]
 *               classesIncluded:
 *                 type: integer
 *                 description: Required for class_pack plans
 *               durationDays:
 *                 type: integer
 *                 description: Required for time_based plans
 *               price:
 *                 type: number
 *                 example: 2500
 *               currency:
 *                 type: string
 *                 example: TRY
 *     responses:
 *       201:
 *         description: Membership plan created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MembershipPlan'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/', membershipPlanController.list);
router.post('/', validate(createMembershipPlanRules), membershipPlanController.create);

/**
 * @swagger
 * /membership-plans/{id}:
 *   get:
 *     tags: [MembershipPlans]
 *     summary: Get membership plan by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Membership plan details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MembershipPlan'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [MembershipPlans]
 *     summary: Update membership plan
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               planType:
 *                 type: string
 *                 enum: [class_pack, time_based, unlimited]
 *               classesIncluded:
 *                 type: integer
 *               durationDays:
 *                 type: integer
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [MembershipPlans]
 *     summary: Delete membership plan
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Plan deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', membershipPlanController.getById);
router.put('/:id', validate(updateMembershipPlanRules), membershipPlanController.update);
router.delete('/:id', membershipPlanController.remove);

module.exports = router;
