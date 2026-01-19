import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams, validateQuery } from '../../middleware/validate'
import * as controller from './helpRequests.controller'
import {
  createHelpRequestSchema,
  respondHelpRequestSchema,
  assignHelpRequestSchema,
  updateStatusSchema,
  helpRequestIdParamSchema,
  listHelpRequestsQuerySchema,
} from './helpRequests.schema'

// ============================================================================
// Student Routes (mounted at /api/student/help-requests)
// ============================================================================

export const studentHelpRequestsRouter = Router()

/**
 * @swagger
 * /api/student/help-requests:
 *   get:
 *     summary: List student's help requests
 *     tags: [Help Requests]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: List of help requests
 */
studentHelpRequestsRouter.get(
  '/',
  authenticate,
  authorize(['student']),
  validateQuery(listHelpRequestsQuerySchema),
  controller.listStudentRequests
)

/**
 * @swagger
 * /api/student/help-requests/{requestId}:
 *   get:
 *     summary: Get help request details
 *     tags: [Help Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Help request details
 */
studentHelpRequestsRouter.get(
  '/:requestId',
  authenticate,
  authorize(['student']),
  validateParams(helpRequestIdParamSchema),
  controller.getStudentRequest
)

/**
 * @swagger
 * /api/student/help-requests:
 *   post:
 *     summary: Create a help request
 *     tags: [Help Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - message
 *             properties:
 *               lessonId:
 *                 type: string
 *               exerciseId:
 *                 type: string
 *               message:
 *                 type: string
 *               codeSnapshot:
 *                 type: string
 *     responses:
 *       201:
 *         description: Help request created
 */
studentHelpRequestsRouter.post(
  '/',
  authenticate,
  authorize(['student']),
  validateBody(createHelpRequestSchema),
  controller.createRequest
)

// ============================================================================
// Teacher/Admin Routes (mounted at /api/help-requests)
// ============================================================================

const adminHelpRequestsRouter = Router()

/**
 * @swagger
 * /api/help-requests:
 *   get:
 *     summary: List all help requests (teachers see their class requests)
 *     tags: [Help Requests Admin]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, closed]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of help requests
 */
adminHelpRequestsRouter.get(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  validateQuery(listHelpRequestsQuerySchema),
  controller.listAllRequests
)

/**
 * @swagger
 * /api/help-requests/{requestId}/respond:
 *   patch:
 *     summary: Respond to a help request
 *     tags: [Help Requests Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Response sent
 */
adminHelpRequestsRouter.patch(
  '/:requestId/respond',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(helpRequestIdParamSchema),
  validateBody(respondHelpRequestSchema),
  controller.respondToRequest
)

/**
 * @swagger
 * /api/help-requests/{requestId}/assign:
 *   patch:
 *     summary: Assign help request to a teacher
 *     tags: [Help Requests Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacherId
 *             properties:
 *               teacherId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request assigned
 */
adminHelpRequestsRouter.patch(
  '/:requestId/assign',
  authenticate,
  authorize(['admin']),
  validateParams(helpRequestIdParamSchema),
  validateBody(assignHelpRequestSchema),
  controller.assignRequest
)

/**
 * @swagger
 * /api/help-requests/{requestId}/status:
 *   patch:
 *     summary: Update help request status
 *     tags: [Help Requests Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Status updated
 */
adminHelpRequestsRouter.patch(
  '/:requestId/status',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(helpRequestIdParamSchema),
  validateBody(updateStatusSchema),
  controller.updateStatus
)

export default adminHelpRequestsRouter
