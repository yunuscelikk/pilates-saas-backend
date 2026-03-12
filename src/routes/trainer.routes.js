const router = require("express").Router();
const trainerController = require("../controllers/trainer.controller");
const { authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createTrainerRules,
  updateTrainerRules,
} = require("../middleware/validators/trainer.validator");

/**
 * @swagger
 * /trainers:
 *   get:
 *     tags: [Trainers]
 *     summary: List trainers
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Paginated trainer list
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
 *                     $ref: '#/components/schemas/Trainer'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Trainers]
 *     summary: Create a new trainer
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
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trainer created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Trainer'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get("/", trainerController.list);
router.get("/stats", trainerController.getStats);
router.post("/", validate(createTrainerRules), trainerController.create);

/**
 * @swagger
 * /trainers/{id}:
 *   get:
 *     tags: [Trainers]
 *     summary: Get trainer by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Trainer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Trainer'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Trainers]
 *     summary: Update trainer
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
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trainer updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Trainers]
 *     summary: Delete trainer
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Trainer deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", trainerController.getById);
router.put("/:id", validate(updateTrainerRules), trainerController.update);
router.delete("/:id", authorize("owner"), trainerController.remove);

module.exports = router;
