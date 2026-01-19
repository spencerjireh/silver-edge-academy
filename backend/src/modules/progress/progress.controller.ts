import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess } from '../../utils/ApiResponse'
import * as progressService from './progress.service'
import type { AuthenticatedRequest } from '../../middleware/auth'
import type { UpdateTimeSpentInput } from './progress.schema'

export const getStudentProgress = asyncHandler(async (req: Request, res: Response) => {
  const summary = await progressService.getStudentProgressSummary(req.params.id)
  sendSuccess(res, summary)
})

export const getStudentCourseProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await progressService.getStudentCourseProgress(
    req.params.id,
    req.params.courseId
  )
  sendSuccess(res, progress)
})

export const startLesson = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const progress = await progressService.startLesson(req.params.lessonId, authReq.user.userId)
  sendSuccess(res, progress.toJSON())
})

export const completeLesson = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const result = await progressService.completeLesson(req.params.lessonId, authReq.user.userId)
  sendSuccess(res, {
    ...result.progress.toJSON(),
    xpEarned: result.xpEarned,
  })
})

export const updateTimeSpent = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as UpdateTimeSpentInput
  const progress = await progressService.updateLessonTimeSpent(
    req.params.lessonId,
    authReq.user.userId,
    input.timeSpentSeconds
  )
  sendSuccess(res, progress.toJSON())
})

export const getLessonProgress = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const progress = await progressService.getLessonProgress(
    req.params.lessonId,
    authReq.user.userId
  )
  sendSuccess(res, progress)
})
