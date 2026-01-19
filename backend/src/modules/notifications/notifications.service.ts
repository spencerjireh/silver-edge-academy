import { Types } from 'mongoose'
import type { PaginationMeta } from '@silveredge/shared'
import { Notification, type INotification, type NotificationType } from './notification.model'
import { ApiError } from '../../utils/ApiError'
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination'
import type { CreateNotificationInput, ListNotificationsQuery } from './notifications.schema'

export interface NotificationListResult {
  notifications: INotification[]
  meta: PaginationMeta
  unreadCount: number
}

export interface StudentNotificationView {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: string
}

export async function listUserNotifications(
  userId: string,
  query: ListNotificationsQuery
): Promise<{ notifications: StudentNotificationView[]; meta: PaginationMeta; unreadCount: number }> {
  const { page, limit, skip } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  }

  if (query.read !== undefined) {
    filter.read = query.read
  }

  if (query.type) {
    filter.type = query.type
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: new Types.ObjectId(userId), read: false }),
  ])

  const notificationViews: StudentNotificationView[] = notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    data: n.data,
    createdAt: n.createdAt.toISOString(),
  }))

  return {
    notifications: notificationViews,
    meta: buildPaginationMeta(total, page, limit),
    unreadCount,
  }
}

export async function getNotificationById(
  userId: string,
  notificationId: string
): Promise<StudentNotificationView> {
  const notification = await Notification.findOne({
    _id: new Types.ObjectId(notificationId),
    userId: new Types.ObjectId(userId),
  })

  if (!notification) {
    throw ApiError.notFound('Notification')
  }

  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data,
    createdAt: notification.createdAt.toISOString(),
  }
}

export async function markAsRead(userId: string, notificationId: string): Promise<StudentNotificationView> {
  const notification = await Notification.findOne({
    _id: new Types.ObjectId(notificationId),
    userId: new Types.ObjectId(userId),
  })

  if (!notification) {
    throw ApiError.notFound('Notification')
  }

  notification.read = true
  await notification.save()

  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data,
    createdAt: notification.createdAt.toISOString(),
  }
}

export async function markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
  const result = await Notification.updateMany(
    { userId: new Types.ObjectId(userId), read: false },
    { read: true }
  )

  return { updatedCount: result.modifiedCount }
}

export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  const notification = await Notification.findOne({
    _id: new Types.ObjectId(notificationId),
    userId: new Types.ObjectId(userId),
  })

  if (!notification) {
    throw ApiError.notFound('Notification')
  }

  await notification.deleteOne()
}

// ============================================================================
// Notification Creation Helpers (for use by other modules)
// ============================================================================

export async function createNotification(input: CreateNotificationInput): Promise<INotification> {
  const notification = await Notification.create({
    userId: new Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data,
    read: false,
  })

  return notification
}

export async function notifyBadgeEarned(
  userId: string,
  badgeName: string,
  badgeId: string
): Promise<INotification> {
  return createNotification({
    userId,
    type: 'badge_earned',
    title: 'Badge Earned!',
    message: `Congratulations! You earned the "${badgeName}" badge!`,
    data: { badgeId },
  })
}

export async function notifyLevelUp(
  userId: string,
  oldLevel: number,
  newLevel: number
): Promise<INotification> {
  return createNotification({
    userId,
    type: 'level_up',
    title: 'Level Up!',
    message: `You advanced from level ${oldLevel} to level ${newLevel}!`,
    data: { oldLevel, newLevel },
  })
}

export async function notifyHelpResponse(
  userId: string,
  helpRequestId: string,
  teacherName: string
): Promise<INotification> {
  return createNotification({
    userId,
    type: 'help_response',
    title: 'Help Request Answered',
    message: `${teacherName} has responded to your help request.`,
    data: { helpRequestId },
  })
}

export async function notifyStreakMilestone(
  userId: string,
  streakDays: number
): Promise<INotification> {
  return createNotification({
    userId,
    type: 'streak',
    title: 'Streak Milestone!',
    message: `Amazing! You've maintained a ${streakDays}-day learning streak!`,
    data: { streakDays },
  })
}
