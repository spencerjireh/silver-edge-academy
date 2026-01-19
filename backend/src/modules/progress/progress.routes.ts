import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { validateParams, validateBody } from '../../middleware/validate'
import * as controller from './progress.controller'
import {
  studentIdParamSchema,
  courseIdParamSchema,
  lessonIdParamSchema,
  updateTimeSpentSchema,
} from './progress.schema'

const router = Router()

// Student progress routes (mounted at /api/students)
router.get(
  '/:id/progress',
  authenticate,
  validateParams(studentIdParamSchema),
  controller.getStudentProgress
)

router.get(
  '/:id/progress/course/:courseId',
  authenticate,
  validateParams(courseIdParamSchema),
  controller.getStudentCourseProgress
)

// Lesson progress routes (mounted at /api/progress)
router.post(
  '/lesson/:lessonId/start',
  authenticate,
  validateParams(lessonIdParamSchema),
  controller.startLesson
)

router.post(
  '/lesson/:lessonId/complete',
  authenticate,
  validateParams(lessonIdParamSchema),
  controller.completeLesson
)

router.patch(
  '/lesson/:lessonId/time',
  authenticate,
  validateParams(lessonIdParamSchema),
  validateBody(updateTimeSpentSchema),
  controller.updateTimeSpent
)

router.get(
  '/lesson/:lessonId',
  authenticate,
  validateParams(lessonIdParamSchema),
  controller.getLessonProgress
)

export default router
