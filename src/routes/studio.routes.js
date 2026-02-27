const router = require('express').Router();
const studioController = require('../controllers/studio.controller');
const validate = require('../middleware/validate');
const { updateStudioRules } = require('../middleware/validators/studio.validator');
const { authorize } = require('../middleware/auth');

/**
 * @swagger
 * /studios/current:
 *   get:
 *     tags: [Studios]
 *     summary: Get current studio
 *     description: Returns the studio associated with the authenticated user.
 *     responses:
 *       200:
 *         description: Studio details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Studio'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   put:
 *     tags: [Studios]
 *     summary: Update current studio
 *     description: Updates the studio details. Requires owner or admin role.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Studio updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Studio'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/current', studioController.getCurrent);
router.put('/current', authorize('owner', 'admin'), validate(updateStudioRules), studioController.updateCurrent);

module.exports = router;
