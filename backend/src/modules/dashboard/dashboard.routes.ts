import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import * as controller from './dashboard.controller'

const router = Router()

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', authenticate, authorize(['admin', 'teacher']), controller.getStats)

/**
 * @swagger
 * /api/admin/dashboard/activity:
 *   get:
 *     summary: Get activity data for the last N days
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days of activity data
 *     responses:
 *       200:
 *         description: Activity data by day
 */
router.get('/activity', authenticate, authorize(['admin', 'teacher']), controller.getActivity)

/**
 * @swagger
 * /api/admin/dashboard/course-completion:
 *   get:
 *     summary: Get course completion metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course completion data
 */
router.get(
  '/course-completion',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.getCourseCompletion
)

/**
 * @swagger
 * /api/admin/dashboard/recently-viewed:
 *   get:
 *     summary: Get recently viewed items for the current admin
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed items
 */
router.get(
  '/recently-viewed',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.getRecentlyViewed
)

/**
 * @swagger
 * /api/admin/dashboard/recently-viewed:
 *   post:
 *     summary: Add item to recently viewed
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [course, class, user]
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added to recently viewed
 */
router.post(
  '/recently-viewed',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.addRecentlyViewed
)

export default router
