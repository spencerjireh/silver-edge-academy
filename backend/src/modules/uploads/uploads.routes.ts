import { Router } from 'express'
import multer from 'multer'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './uploads.controller'
import { uploadQuerySchema, deleteParamSchema, maxFileSizeMB } from './uploads.schema'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
  },
})

router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  upload.single('file'),
  validateQuery(uploadQuerySchema),
  controller.upload
)

router.delete(
  '/:key',
  authenticate,
  authorize(['admin']),
  validateParams(deleteParamSchema),
  controller.remove
)

router.get(
  '/:key/signed-url',
  authenticate,
  validateParams(deleteParamSchema),
  controller.getSignedUrl
)

export default router
