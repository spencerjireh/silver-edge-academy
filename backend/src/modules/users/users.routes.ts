import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize, authorizeOwnerOrRoles } from '../../middleware/authorize'
import { validateBody, validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './users.controller'
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  listUsersQuerySchema,
  idParamSchema,
  updateUserStatusSchema,
} from './users.schema'

const router = Router()

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users with filtering and pagination
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, parent, student]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  validateQuery(listUsersQuerySchema),
  controller.list
)

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created
 */
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateBody(createUserSchema),
  controller.create
)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, validateParams(idParamSchema), controller.getById)

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  authorizeOwnerOrRoles(['admin'], (req) => req.params.id),
  validateBody(updateUserSchema),
  controller.update
)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deactivated
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
 * /users/{id}/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change user password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.patch(
  '/:id/password',
  authenticate,
  validateParams(idParamSchema),
  validateBody(changePasswordSchema),
  controller.changePassword
)

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Update user status
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  validateBody(updateUserStatusSchema),
  controller.updateStatus
)

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get student profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student profile
 */
router.get('/:id/profile', authenticate, validateParams(idParamSchema), controller.getProfile)

/**
 * @swagger
 * /users/{id}/classes:
 *   get:
 *     tags: [Users]
 *     summary: Get teacher's classes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get(
  '/:id/classes',
  authenticate,
  validateParams(idParamSchema),
  controller.getTeacherClasses
)

/**
 * @swagger
 * /users/{id}/children:
 *   get:
 *     tags: [Users]
 *     summary: Get parent's children
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of children
 */
router.get(
  '/:id/children',
  authenticate,
  validateParams(idParamSchema),
  controller.getParentChildren
)

/**
 * @swagger
 * /users/{id}/achievements:
 *   get:
 *     tags: [Users]
 *     summary: Get student achievements (badges, XP, level)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student achievements
 */
router.get(
  '/:id/achievements',
  authenticate,
  validateParams(idParamSchema),
  controller.getAchievements
)

/**
 * @swagger
 * /users/{id}/courses:
 *   get:
 *     tags: [Users]
 *     summary: Get student's enrolled courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/:id/courses', authenticate, validateParams(idParamSchema), controller.getCourses)

/**
 * @swagger
 * /users/{studentId}/parents/{parentId}:
 *   post:
 *     tags: [Users]
 *     summary: Link a parent to a student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parent linked
 */
router.post('/:studentId/parents/:parentId', authenticate, authorize(['admin']), controller.linkParent)

/**
 * @swagger
 * /users/{studentId}/parents/{parentId}:
 *   delete:
 *     tags: [Users]
 *     summary: Unlink a parent from a student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parent unlinked
 */
router.delete(
  '/:studentId/parents/:parentId',
  authenticate,
  authorize(['admin']),
  controller.unlinkParent
)

/**
 * @swagger
 * /users/{parentId}/students/{studentId}:
 *   post:
 *     tags: [Users]
 *     summary: Link a student to a parent
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student linked
 */
router.post(
  '/:parentId/students/:studentId',
  authenticate,
  authorize(['admin']),
  controller.linkStudent
)

/**
 * @swagger
 * /users/{parentId}/students/{studentId}:
 *   delete:
 *     tags: [Users]
 *     summary: Unlink a student from a parent
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student unlinked
 */
router.delete(
  '/:parentId/students/:studentId',
  authenticate,
  authorize(['admin']),
  controller.unlinkStudent
)

export default router
