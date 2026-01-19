import { z } from 'zod'

const badgeTriggerTypes = [
  'first_login',
  'first_lesson',
  'first_exercise',
  'first_quiz',
  'first_sandbox',
  'lessons_completed',
  'exercises_passed',
  'courses_finished',
  'login_streak',
  'xp_earned',
  'level_reached',
] as const

export const createBadgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  iconName: z.string().min(1).max(50),
  gradientFrom: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  gradientTo: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  triggerType: z.enum(badgeTriggerTypes),
  triggerValue: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export const updateBadgeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  iconName: z.string().min(1).max(50).optional(),
  gradientFrom: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  gradientTo: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  triggerType: z.enum(badgeTriggerTypes).optional(),
  triggerValue: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export const listBadgesQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  triggerType: z.enum(badgeTriggerTypes).optional(),
})

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format'),
})

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>
export type ListBadgesQuery = z.infer<typeof listBadgesQuerySchema>
