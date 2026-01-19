import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendNoContent } from '../../utils/ApiResponse'
import type { AuthenticatedRequest } from '../../middleware/auth'
import * as notificationsService from './notifications.service'
import type { NotificationIdParam, ListNotificationsQuery } from './notifications.schema'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const query = req.query as unknown as ListNotificationsQuery
  const result = await notificationsService.listUserNotifications(authReq.user.userId, query)
  // Return format expected by frontend: { notifications, unreadCount }
  res.status(200).json({
    notifications: result.notifications,
    unreadCount: result.unreadCount,
  })
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as NotificationIdParam
  const notification = await notificationsService.getNotificationById(
    authReq.user.userId,
    params.notificationId
  )
  sendSuccess(res, notification)
})

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as NotificationIdParam
  const notification = await notificationsService.markAsRead(authReq.user.userId, params.notificationId)
  sendSuccess(res, notification)
})

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const result = await notificationsService.markAllAsRead(authReq.user.userId)
  sendSuccess(res, result)
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as NotificationIdParam
  await notificationsService.deleteNotification(authReq.user.userId, params.notificationId)
  sendNoContent(res)
})
