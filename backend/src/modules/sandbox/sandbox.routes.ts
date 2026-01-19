import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams, validateQuery } from '../../middleware/validate'
import * as controller from './sandbox.controller'
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  listProjectsQuerySchema,
} from './sandbox.schema'

const router = Router()

/**
 * @swagger
 * /api/student/sandbox/projects:
 *   get:
 *     summary: List student's sandbox projects
 *     tags: [Sandbox]
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
 *         name: language
 *         schema:
 *           type: string
 *           enum: [javascript, python]
 *     responses:
 *       200:
 *         description: List of sandbox projects
 */
router.get(
  '/projects',
  authenticate,
  authorize(['student']),
  validateQuery(listProjectsQuerySchema),
  controller.list
)

/**
 * @swagger
 * /api/student/sandbox/projects/{projectId}:
 *   get:
 *     summary: Get a sandbox project by ID
 *     tags: [Sandbox]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 */
router.get(
  '/projects/:projectId',
  authenticate,
  authorize(['student']),
  validateParams(projectIdParamSchema),
  controller.getById
)

/**
 * @swagger
 * /api/student/sandbox/projects:
 *   post:
 *     summary: Create a new sandbox project
 *     tags: [Sandbox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [javascript, python]
 *               code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
router.post(
  '/projects',
  authenticate,
  authorize(['student']),
  validateBody(createProjectSchema),
  controller.create
)

/**
 * @swagger
 * /api/student/sandbox/projects/{projectId}:
 *   patch:
 *     summary: Update a sandbox project
 *     tags: [Sandbox]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 */
router.patch(
  '/projects/:projectId',
  authenticate,
  authorize(['student']),
  validateParams(projectIdParamSchema),
  validateBody(updateProjectSchema),
  controller.update
)

/**
 * @swagger
 * /api/student/sandbox/projects/{projectId}:
 *   delete:
 *     summary: Delete a sandbox project
 *     tags: [Sandbox]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Project deleted
 */
router.delete(
  '/projects/:projectId',
  authenticate,
  authorize(['student']),
  validateParams(projectIdParamSchema),
  controller.remove
)

export default router
