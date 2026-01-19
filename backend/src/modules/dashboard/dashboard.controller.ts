import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess } from '../../utils/ApiResponse'
import * as dashboardService from './dashboard.service'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats()
  sendSuccess(res, stats)
})

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7
  const activity = await dashboardService.getActivityData(days)
  sendSuccess(res, activity)
})

export const getCourseCompletion = asyncHandler(async (_req: Request, res: Response) => {
  const completionData = await dashboardService.getCourseCompletionByLanguage()
  sendSuccess(res, completionData)
})

export const getRecentlyViewed = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const items = dashboardService.getRecentlyViewed(authReq.user.userId)
  sendSuccess(res, items)
})

export const addRecentlyViewed = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const { type, id, name } = req.body
  dashboardService.addRecentlyViewed(authReq.user.userId, { type, id, name })
  sendSuccess(res, { message: 'Added to recently viewed' })
})
