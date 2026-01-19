import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams } from '../../middleware/validate'
import * as controller from './quizzes.controller'
import {
  createQuizSchema,
  updateQuizSchema,
  submitQuizSchema,
  lessonIdParamSchema,
  quizIdParamSchema,
  quizOnlyIdParamSchema,
} from './quizzes.schema'

const router = Router()

// Routes nested under /lessons/:lessonId
router.get(
  '/:lessonId/quizzes',
  authenticate,
  validateParams(lessonIdParamSchema),
  controller.list
)

router.post(
  '/:lessonId/quizzes',
  authenticate,
  authorize(['admin']),
  validateParams(lessonIdParamSchema),
  validateBody(createQuizSchema),
  controller.create
)

router.get(
  '/:lessonId/quizzes/:quizId',
  authenticate,
  validateParams(quizIdParamSchema),
  controller.getById
)

router.patch(
  '/:lessonId/quizzes/:quizId',
  authenticate,
  authorize(['admin']),
  validateParams(quizIdParamSchema),
  validateBody(updateQuizSchema),
  controller.update
)

router.delete(
  '/:lessonId/quizzes/:quizId',
  authenticate,
  authorize(['admin']),
  validateParams(quizIdParamSchema),
  controller.remove
)

// Submission routes at /api/quizzes/:id
router.post(
  '/:id/submit',
  authenticate,
  authorize(['student']),
  validateParams(quizOnlyIdParamSchema),
  validateBody(submitQuizSchema),
  controller.submit
)

router.get(
  '/:id/results',
  authenticate,
  validateParams(quizOnlyIdParamSchema),
  controller.getResults
)

export default router
