import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './shop.controller'
import {
  createShopItemSchema,
  updateShopItemSchema,
  listShopItemsQuerySchema,
  idParamSchema,
} from './shop.schema'

const router = Router()

/**
 * @swagger
 * /api/shop:
 *   get:
 *     summary: List all shop items
 *     tags: [Shop]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [avatar_pack, ui_theme, editor_theme, teacher_reward]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of shop items
 */
router.get('/', authenticate, validateQuery(listShopItemsQuerySchema), controller.list)

/**
 * @swagger
 * /api/shop/my-purchases:
 *   get:
 *     summary: Get current student's purchases
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchases
 */
router.get('/my-purchases', authenticate, authorize(['student']), controller.getMyPurchases)

/**
 * @swagger
 * /api/shop/{id}:
 *   get:
 *     summary: Get shop item by ID
 *     tags: [Shop]
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
 *         description: Shop item details
 */
router.get('/:id', authenticate, validateParams(idParamSchema), controller.getById)

/**
 * @swagger
 * /api/shop:
 *   post:
 *     summary: Create a new shop item
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShopItem'
 *     responses:
 *       201:
 *         description: Shop item created
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  validateBody(createShopItemSchema),
  controller.create
)

/**
 * @swagger
 * /api/shop/{id}:
 *   patch:
 *     summary: Update a shop item
 *     tags: [Shop]
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
 *             $ref: '#/components/schemas/UpdateShopItem'
 *     responses:
 *       200:
 *         description: Shop item updated
 */
router.patch(
  '/:id',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  validateBody(updateShopItemSchema),
  controller.update
)

/**
 * @swagger
 * /api/shop/{id}:
 *   delete:
 *     summary: Delete a shop item
 *     tags: [Shop]
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
 *         description: Shop item deleted
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
 * /api/shop/{id}/toggle:
 *   patch:
 *     summary: Toggle shop item active status
 *     tags: [Shop]
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
 *         description: Shop item status toggled
 */
router.patch(
  '/:id/toggle',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  controller.toggle
)

/**
 * @swagger
 * /api/shop/{id}/purchase:
 *   post:
 *     summary: Purchase a shop item (student only)
 *     tags: [Shop]
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
 *         description: Item purchased
 */
router.post(
  '/:id/purchase',
  authenticate,
  authorize(['student']),
  validateParams(idParamSchema),
  controller.purchase
)

export default router
