const router = require("express").Router();
const classController = require("../controllers/class.controller");
const { authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const checkPlanLimit = require("../middleware/checkPlanLimit");
const {
  createClassRules,
  updateClassRules,
} = require("../middleware/validators/class.validator");

/**
 * @swagger
 * /classes:
 *   get:
 *     tags: [Classes]
 *     summary: List classes
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: classType
 *         schema:
 *           type: string
 *           enum: [group, private, semi_private]
 *         description: Filter by class type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Paginated class list
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
 *                     $ref: '#/components/schemas/Class'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Classes]
 *     summary: Create a new class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mat Pilates
 *               description:
 *                 type: string
 *               durationMinutes:
 *                 type: integer
 *                 example: 60
 *               maxCapacity:
 *                 type: integer
 *                 example: 12
 *               classType:
 *                 type: string
 *                 enum: [group, private, semi_private]
 *     responses:
 *       201:
 *         description: Class created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get("/", classController.list);
router.get("/stats", classController.getStats);
router.post(
  "/",
  checkPlanLimit("classes"),
  validate(createClassRules),
  classController.create,
);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     tags: [Classes]
 *     summary: Get class by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Class details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Classes]
 *     summary: Update class
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
 *               durationMinutes:
 *                 type: integer
 *               maxCapacity:
 *                 type: integer
 *               classType:
 *                 type: string
 *                 enum: [group, private, semi_private]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Class updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Classes]
 *     summary: Delete class
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Class deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", classController.getById);
router.put("/:id", validate(updateClassRules), classController.update);
router.delete("/:id", authorize("owner"), classController.remove);

module.exports = router;
