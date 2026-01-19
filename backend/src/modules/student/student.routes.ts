import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams, validateQuery } from '../../middleware/validate'
import * as controller from './student.controller'
import sandboxRoutes from '../sandbox/sandbox.routes'
import { studentHelpRequestsRouter } from '../helpRequests/helpRequests.routes'
import notificationsRoutes from '../notifications/notifications.routes'
import {
  studentLoginSchema,
  studentLogoutSchema,
  updateProfileSchema,
  courseIdParamSchema,
  lessonIdParamSchema,
  exerciseIdParamSchema,
  quizIdParamSchema,
  submitExerciseSchema,
  submitQuizSchema,
  purchaseItemSchema,
  equipItemSchema,
  xpHistoryQuerySchema,
} from './student.schema'

const router = Router()

// ============================================================================
// Auth Routes
// ============================================================================

/**
 * @swagger
 * /api/student/auth/login:
 *   post:
 *     summary: Student login
 *     tags: [Student Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/auth/login', validateBody(studentLoginSchema), controller.login)

/**
 * @swagger
 * /api/student/auth/logout:
 *   post:
 *     summary: Student logout
 *     tags: [Student Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  '/auth/logout',
  authenticate,
  authorize(['student']),
  validateBody(studentLogoutSchema),
  controller.logout
)

/**
 * @swagger
 * /api/student/auth/me:
 *   get:
 *     summary: Get current student user
 *     tags: [Student Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get('/auth/me', authenticate, authorize(['student']), controller.getMe)

// ============================================================================
// Dashboard Route
// ============================================================================

/**
 * @swagger
 * /api/student/dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Student Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data including courses, badges, stats
 */
router.get('/dashboard', authenticate, authorize(['student']), controller.getDashboard)

// ============================================================================
// Course Routes
// ============================================================================

/**
 * @swagger
 * /api/student/courses:
 *   get:
 *     summary: Get student's enrolled courses
 *     tags: [Student Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses with progress
 */
router.get('/courses', authenticate, authorize(['student']), controller.getCourses)

/**
 * @swagger
 * /api/student/courses/{courseId}:
 *   get:
 *     summary: Get course map with sections and lessons
 *     tags: [Student Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course map with lesson statuses
 */
router.get(
  '/courses/:courseId',
  authenticate,
  authorize(['student']),
  validateParams(courseIdParamSchema),
  controller.getCourseMap
)

// ============================================================================
// Lesson Routes
// ============================================================================

/**
 * @swagger
 * /api/student/lessons/{lessonId}:
 *   get:
 *     summary: Get lesson content
 *     tags: [Student Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson content with steps
 */
router.get(
  '/lessons/:lessonId',
  authenticate,
  authorize(['student']),
  validateParams(lessonIdParamSchema),
  controller.getLesson
)

/**
 * @swagger
 * /api/student/lessons/{lessonId}/complete:
 *   post:
 *     summary: Mark lesson as complete
 *     tags: [Student Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson marked complete, XP earned
 */
router.post(
  '/lessons/:lessonId/complete',
  authenticate,
  authorize(['student']),
  validateParams(lessonIdParamSchema),
  controller.completeLessonHandler
)

// ============================================================================
// Exercise Routes
// ============================================================================

/**
 * @swagger
 * /api/student/exercises/{exerciseId}:
 *   get:
 *     summary: Get exercise details
 *     tags: [Student Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise details (without solution)
 */
router.get(
  '/exercises/:exerciseId',
  authenticate,
  authorize(['student']),
  validateParams(exerciseIdParamSchema),
  controller.getExercise
)

/**
 * @swagger
 * /api/student/exercises/{exerciseId}/submit:
 *   post:
 *     summary: Submit exercise code
 *     tags: [Student Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
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
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission result with test outcomes
 */
router.post(
  '/exercises/:exerciseId/submit',
  authenticate,
  authorize(['student']),
  validateParams(exerciseIdParamSchema),
  validateBody(submitExerciseSchema),
  controller.submitExerciseHandler
)

// ============================================================================
// Quiz Routes
// ============================================================================

/**
 * @swagger
 * /api/student/quizzes/{quizId}:
 *   get:
 *     summary: Get quiz with questions
 *     tags: [Student Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz details with questions (without answers)
 */
router.get(
  '/quizzes/:quizId',
  authenticate,
  authorize(['student']),
  validateParams(quizIdParamSchema),
  controller.getQuiz
)

/**
 * @swagger
 * /api/student/quizzes/{quizId}/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Student Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
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
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedIndex:
 *                       type: number
 *     responses:
 *       200:
 *         description: Quiz result with score
 */
router.post(
  '/quizzes/:quizId/submit',
  authenticate,
  authorize(['student']),
  validateParams(quizIdParamSchema),
  validateBody(submitQuizSchema),
  controller.submitQuizHandler
)

// ============================================================================
// Badge Routes
// ============================================================================

/**
 * @swagger
 * /api/student/badges:
 *   get:
 *     summary: Get all badges with earned status
 *     tags: [Student Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of badges with earned status
 */
router.get('/badges', authenticate, authorize(['student']), controller.getBadges)

// ============================================================================
// XP History Route
// ============================================================================

/**
 * @swagger
 * /api/student/xp-history:
 *   get:
 *     summary: Get XP transaction history
 *     tags: [Student Gamification]
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
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [lesson_complete, exercise_complete, quiz_complete, daily_login, streak_bonus, badge_earned]
 *     responses:
 *       200:
 *         description: Paginated XP history
 */
router.get(
  '/xp-history',
  authenticate,
  authorize(['student']),
  validateQuery(xpHistoryQuerySchema),
  controller.getXpHistory
)

// ============================================================================
// Shop Routes
// ============================================================================

/**
 * @swagger
 * /api/student/shop/items:
 *   get:
 *     summary: Get shop items with ownership status
 *     tags: [Student Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shop items
 */
router.get('/shop/items', authenticate, authorize(['student']), controller.getShopItems)

/**
 * @swagger
 * /api/student/shop/inventory:
 *   get:
 *     summary: Get owned items
 *     tags: [Student Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owned items
 */
router.get('/shop/inventory', authenticate, authorize(['student']), controller.getInventory)

/**
 * @swagger
 * /api/student/shop/purchase:
 *   post:
 *     summary: Purchase a shop item
 *     tags: [Student Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase result
 */
router.post(
  '/shop/purchase',
  authenticate,
  authorize(['student']),
  validateBody(purchaseItemSchema),
  controller.purchaseItemHandler
)

/**
 * @swagger
 * /api/student/shop/equip:
 *   post:
 *     summary: Equip an owned item
 *     tags: [Student Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - slot
 *             properties:
 *               itemId:
 *                 type: string
 *               slot:
 *                 type: string
 *                 enum: [avatar, uiTheme, editorTheme]
 *     responses:
 *       200:
 *         description: Equip result
 */
router.post(
  '/shop/equip',
  authenticate,
  authorize(['student']),
  validateBody(equipItemSchema),
  controller.equipItemHandler
)

// ============================================================================
// Profile Routes
// ============================================================================

/**
 * @swagger
 * /api/student/profile:
 *   get:
 *     summary: Get student profile
 *     tags: [Student Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile data
 */
router.get('/profile', authenticate, authorize(['student']), controller.getProfile)

/**
 * @swagger
 * /api/student/profile:
 *   patch:
 *     summary: Update student profile
 *     tags: [Student Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               avatarId:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, system]
 *                   editorTheme:
 *                     type: string
 *                   fontSize:
 *                     type: number
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.patch(
  '/profile',
  authenticate,
  authorize(['student']),
  validateBody(updateProfileSchema),
  controller.updateProfile
)

// ============================================================================
// Mount Sub-Routers
// ============================================================================

// Sandbox routes (/api/student/sandbox/*)
router.use('/sandbox', sandboxRoutes)

// Help requests routes (/api/student/help-requests/*)
router.use('/help-requests', studentHelpRequestsRouter)

// Notifications routes (/api/student/notifications/*)
router.use('/notifications', notificationsRoutes)

export default router
