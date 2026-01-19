import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams } from '../../middleware/validate'
import * as controller from './exercises.controller'
import {
  createExerciseSchema,
  updateExerciseSchema,
  submitExerciseSchema,
  lessonIdParamSchema,
  exerciseIdParamSchema,
  exerciseOnlyIdParamSchema,
} from './exercises.schema'

const router = Router()

// Routes nested under /lessons/:lessonId
router.get(
  '/:lessonId/exercises',
  authenticate,
  validateParams(lessonIdParamSchema),
  controller.list
)

router.post(
  '/:lessonId/exercises',
  authenticate,
  authorize(['admin']),
  validateParams(lessonIdParamSchema),
  validateBody(createExerciseSchema),
  controller.create
)

router.get(
  '/:lessonId/exercises/:exerciseId',
  authenticate,
  validateParams(exerciseIdParamSchema),
  controller.getById
)

router.patch(
  '/:lessonId/exercises/:exerciseId',
  authenticate,
  authorize(['admin']),
  validateParams(exerciseIdParamSchema),
  validateBody(updateExerciseSchema),
  controller.update
)

router.delete(
  '/:lessonId/exercises/:exerciseId',
  authenticate,
  authorize(['admin']),
  validateParams(exerciseIdParamSchema),
  controller.remove
)

// Submission routes at /api/exercises/:id
router.post(
  '/:id/submit',
  authenticate,
  authorize(['student']),
  validateParams(exerciseOnlyIdParamSchema),
  validateBody(submitExerciseSchema),
  controller.submit
)

router.get(
  '/:id/submissions',
  authenticate,
  validateParams(exerciseOnlyIdParamSchema),
  controller.getSubmissions
)

export default router
