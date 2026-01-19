import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './badges.controller'
import {
  createBadgeSchema,
  updateBadgeSchema,
  listBadgesQuerySchema,
  idParamSchema,
} from './badges.schema'

const router = Router()

/**
 * @swagger
 * /api/badges:
 *   get:
 *     summary: List all badges
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: triggerType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of badges
 */
router.get('/', authenticate, validateQuery(listBadgesQuerySchema), controller.list)

/**
 * @swagger
 * /api/badges/{id}:
 *   get:
 *     summary: Get badge by ID
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge details
 */
router.get('/:id', authenticate, validateParams(idParamSchema), controller.getById)

/**
 * @swagger
 * /api/badges:
 *   post:
 *     summary: Create a new badge
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBadge'
 *     responses:
 *       201:
 *         description: Badge created
 */
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateBody(createBadgeSchema),
  controller.create
)

/**
 * @swagger
 * /api/badges/{id}:
 *   patch:
 *     summary: Update a badge
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBadge'
 *     responses:
 *       200:
 *         description: Badge updated
 */
router.patch(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  validateBody(updateBadgeSchema),
  controller.update
)

/**
 * @swagger
 * /api/badges/{id}:
 *   delete:
 *     summary: Delete a badge
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Badge deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  controller.remove
)

/**
 * @swagger
 * /api/badges/{id}/earned-students:
 *   get:
 *     summary: Get students who earned this badge
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of students who earned the badge
 */
router.get(
  '/:id/earned-students',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  controller.getEarnedStudents
)

/**
 * @swagger
 * /api/badges/{id}/award:
 *   post:
 *     summary: Award a badge to a student
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge awarded
 */
router.post(
  '/:id/award',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  controller.awardBadge
)

export default router
