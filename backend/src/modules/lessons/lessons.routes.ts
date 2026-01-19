import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams } from '../../middleware/validate'
import * as controller from './lessons.controller'
import {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  sectionIdParamSchema,
  lessonIdParamSchema,
} from './lessons.schema'

const router = Router()

router.get(
  '/:courseId/sections/:sectionId/lessons',
  authenticate,
  validateParams(sectionIdParamSchema),
  controller.list
)

router.post(
  '/:courseId/sections/:sectionId/lessons',
  authenticate,
  authorize(['admin']),
  validateParams(sectionIdParamSchema),
  validateBody(createLessonSchema),
  controller.create
)

// Reorder route must come before :lessonId routes to avoid matching "reorder" as a lessonId
router.patch(
  '/:courseId/sections/:sectionId/lessons/reorder',
  authenticate,
  authorize(['admin']),
  validateParams(sectionIdParamSchema),
  validateBody(reorderLessonsSchema),
  controller.reorder
)

router.get(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  validateParams(lessonIdParamSchema),
  controller.getById
)

router.patch(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  authorize(['admin']),
  validateParams(lessonIdParamSchema),
  validateBody(updateLessonSchema),
  controller.update
)

router.delete(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  authorize(['admin']),
  validateParams(lessonIdParamSchema),
  controller.remove
)

router.post(
  '/:courseId/sections/:sectionId/lessons/:lessonId/lock',
  authenticate,
  authorize(['admin']),
  validateParams(lessonIdParamSchema),
  controller.acquireLock
)

router.delete(
  '/:courseId/sections/:sectionId/lessons/:lessonId/lock',
  authenticate,
  authorize(['admin']),
  validateParams(lessonIdParamSchema),
  controller.releaseLock
)

export default router
