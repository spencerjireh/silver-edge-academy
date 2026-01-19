import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateParams, validateQuery } from '../../middleware/validate'
import * as controller from './notifications.controller'
import { notificationIdParamSchema, listNotificationsQuerySchema } from './notifications.schema'

const router = Router()

/**
 * @swagger
 * /api/student/notifications:
 *   get:
 *     summary: List user notifications
 *     tags: [Notifications]
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
 *         name: read
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [help_response, badge_earned, level_up, streak, general]
 *     responses:
 *       200:
 *         description: List of notifications with unread count
 */
router.get(
  '/',
  authenticate,
  authorize(['student']),
  validateQuery(listNotificationsQuerySchema),
  controller.list
)

/**
 * @swagger
 * /api/student/notifications/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification details
 */
router.get(
  '/:notificationId',
  authenticate,
  authorize(['student']),
  validateParams(notificationIdParamSchema),
  controller.getById
)

/**
 * @swagger
 * /api/student/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch(
  '/:notificationId/read',
  authenticate,
  authorize(['student']),
  validateParams(notificationIdParamSchema),
  controller.markAsRead
)

/**
 * @swagger
 * /api/student/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', authenticate, authorize(['student']), controller.markAllAsRead)

/**
 * @swagger
 * /api/student/notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Notification deleted
 */
router.delete(
  '/:notificationId',
  authenticate,
  authorize(['student']),
  validateParams(notificationIdParamSchema),
  controller.remove
)

export default router
