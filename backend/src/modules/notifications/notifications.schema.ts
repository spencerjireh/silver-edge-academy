import { z } from 'zod'

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['help_response', 'badge_earned', 'level_up', 'streak', 'general']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.record(z.unknown()).optional(),
})
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

export const notificationIdParamSchema = z.object({
  notificationId: z.string().min(1),
})
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  read: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
  type: z.enum(['help_response', 'badge_earned', 'level_up', 'streak', 'general']).optional(),
})
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>
