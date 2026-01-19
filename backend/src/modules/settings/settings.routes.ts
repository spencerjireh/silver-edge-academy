import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody } from '../../middleware/validate'
import * as controller from './settings.controller'
import {
  updateGamificationSchema,
  updateFeaturesSchema,
  updateSingleFeatureSchema,
  updateSystemSchema,
} from './settings.schema'

const router = Router()

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All settings
 */
router.get('/', authenticate, authorize(['admin']), controller.getAll)

/**
 * @swagger
 * /api/settings/gamification:
 *   get:
 *     summary: Get gamification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gamification settings
 */
router.get('/gamification', authenticate, authorize(['admin']), controller.getGamification)

/**
 * @swagger
 * /api/settings/gamification:
 *   patch:
 *     summary: Update gamification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGamification'
 *     responses:
 *       200:
 *         description: Gamification settings updated
 */
router.patch(
  '/gamification',
  authenticate,
  authorize(['admin']),
  validateBody(updateGamificationSchema),
  controller.updateGamification
)

/**
 * @swagger
 * /api/settings/features:
 *   get:
 *     summary: Get feature toggles
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feature toggles
 */
router.get('/features', authenticate, authorize(['admin']), controller.getFeatures)

/**
 * @swagger
 * /api/settings/features/{key}:
 *   patch:
 *     summary: Update a single feature toggle
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature key to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feature toggle updated
 */
router.patch(
  '/features/:key',
  authenticate,
  authorize(['admin']),
  validateBody(updateSingleFeatureSchema),
  controller.updateSingleFeature
)

/**
 * @swagger
 * /api/settings/features:
 *   patch:
 *     summary: Update feature toggles
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 enabled:
 *                   type: boolean
 *     responses:
 *       200:
 *         description: Feature toggles updated
 */
router.patch(
  '/features',
  authenticate,
  authorize(['admin']),
  validateBody(updateFeaturesSchema),
  controller.updateFeatures
)

/**
 * @swagger
 * /api/settings/system:
 *   get:
 *     summary: Get system settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 */
router.get('/system', authenticate, authorize(['admin']), controller.getSystem)

/**
 * @swagger
 * /api/settings/system:
 *   patch:
 *     summary: Update system settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSystem'
 *     responses:
 *       200:
 *         description: System settings updated
 */
router.patch(
  '/system',
  authenticate,
  authorize(['admin']),
  validateBody(updateSystemSchema),
  controller.updateSystem
)

/**
 * @swagger
 * /api/settings/storage:
 *   get:
 *     summary: Get storage info
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage information
 */
router.get('/storage', authenticate, authorize(['admin']), controller.getStorage)

export default router
