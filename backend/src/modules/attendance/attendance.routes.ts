import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './attendance.controller'
import {
  markAttendanceSchema,
  listAttendanceQuerySchema,
  classIdParamSchema,
} from './attendance.schema'

const router = Router()

// These routes are mounted at /api/classes via app.ts
router.get(
  '/:id/attendance',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(classIdParamSchema),
  validateQuery(listAttendanceQuerySchema),
  controller.list
)

router.post(
  '/:id/attendance',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(classIdParamSchema),
  validateBody(markAttendanceSchema),
  controller.mark
)

router.get(
  '/:id/attendance/summary',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(classIdParamSchema),
  controller.getSummary
)

export default router
