import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateParams } from '../../middleware/validate'
import * as controller from './sections.controller'
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
  courseIdParamSchema,
  sectionIdParamSchema,
} from './sections.schema'

const router = Router()

router.get(
  '/:courseId/sections',
  authenticate,
  validateParams(courseIdParamSchema),
  controller.list
)

router.post(
  '/:courseId/sections',
  authenticate,
  authorize(['admin']),
  validateParams(courseIdParamSchema),
  validateBody(createSectionSchema),
  controller.create
)

router.get(
  '/:courseId/sections/:sectionId',
  authenticate,
  validateParams(sectionIdParamSchema),
  controller.getById
)

router.patch(
  '/:courseId/sections/:sectionId',
  authenticate,
  authorize(['admin']),
  validateParams(sectionIdParamSchema),
  validateBody(updateSectionSchema),
  controller.update
)

router.delete(
  '/:courseId/sections/:sectionId',
  authenticate,
  authorize(['admin']),
  validateParams(sectionIdParamSchema),
  controller.remove
)

router.patch(
  '/:courseId/sections/reorder',
  authenticate,
  authorize(['admin']),
  validateParams(courseIdParamSchema),
  validateBody(reorderSectionsSchema),
  controller.reorder
)

export default router
