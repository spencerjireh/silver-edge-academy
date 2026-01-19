import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './courses.controller'
import {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
  idParamSchema,
} from './courses.schema'

const router = Router()

router.get('/', authenticate, validateQuery(listCoursesQuerySchema), controller.list)

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateBody(createCourseSchema),
  controller.create
)

router.get('/:id', authenticate, validateParams(idParamSchema), controller.getById)

router.patch(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  validateBody(updateCourseSchema),
  controller.update
)

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  controller.remove
)

router.patch(
  '/:id/publish',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  controller.publish
)

router.patch(
  '/:id/unpublish',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  controller.unpublish
)

export default router
