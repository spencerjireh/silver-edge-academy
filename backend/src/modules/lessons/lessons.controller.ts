import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as lessonsService from './lessons.service'
import type { CreateLessonInput, UpdateLessonInput, ReorderLessonsInput } from './lessons.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const lessons = await lessonsService.listLessons(req.params.sectionId)
  sendSuccess(res, lessons.map((l) => l.toJSON()))
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await lessonsService.getLessonById(req.params.sectionId, req.params.lessonId)
  sendSuccess(res, lesson)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateLessonInput
  const lesson = await lessonsService.createLesson(req.params.sectionId, input)
  sendCreated(res, lesson.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateLessonInput
  const lesson = await lessonsService.updateLesson(
    req.params.sectionId,
    req.params.lessonId,
    input
  )
  sendSuccess(res, lesson.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await lessonsService.deleteLesson(req.params.sectionId, req.params.lessonId)
  sendNoContent(res)
})

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ReorderLessonsInput
  await lessonsService.reorderLessons(req.params.sectionId, input.lessonIds)
  sendSuccess(res, { message: 'Lessons reordered' })
})

export const acquireLock = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const lesson = await lessonsService.acquireLock(req.params.lessonId, authReq.user.userId)
  sendSuccess(res, lesson.toJSON())
})

export const releaseLock = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  await lessonsService.releaseLock(req.params.lessonId, authReq.user.userId)
  sendNoContent(res)
})
