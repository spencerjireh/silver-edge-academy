import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendNoContent } from '../../utils/ApiResponse'
import * as uploadsService from './uploads.service'
import { ApiError } from '../../utils/ApiError'
import type { UploadQuery } from './uploads.schema'

export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file provided')
  }

  const query = req.query as unknown as UploadQuery
  const result = await uploadsService.uploadFile(req.file, query.folder)
  sendSuccess(res, result)
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await uploadsService.deleteFile(req.params.key)
  sendNoContent(res)
})

export const getSignedUrl = asyncHandler(async (req: Request, res: Response) => {
  const url = await uploadsService.getSignedDownloadUrl(req.params.key)
  sendSuccess(res, { url })
})
