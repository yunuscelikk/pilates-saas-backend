const router = require("express").Router();
const memberController = require("../controllers/member.controller");
const { authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const checkPlanLimit = require("../middleware/checkPlanLimit");
const {
  createMemberRules,
  updateMemberRules,
} = require("../middleware/validators/member.validator");

/**
 * @swagger
 * /members:
 *   get:
 *     tags: [Members]
 *     summary: List members
 *     description: Returns a paginated list of members. Supports search by name, email, or phone.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Paginated member list
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
 *                     $ref: '#/components/schemas/Member'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Members]
 *     summary: Create a new member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", memberController.list);
router.post(
  "/",
  checkPlanLimit("members"),
  validate(createMemberRules),
  memberController.create,
);

router.get("/stats", memberController.getStats);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     tags: [Members]
 *     summary: Get member by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Member details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Members]
 *     summary: Update member
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Member updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Members]
 *     summary: Delete member (soft-delete)
 *     description: Soft-deletes the member. The record is retained but hidden from queries.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Member deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", memberController.getById);
router.put("/:id", validate(updateMemberRules), memberController.update);
router.delete("/:id", authorize("owner"), memberController.remove);

module.exports = router;
