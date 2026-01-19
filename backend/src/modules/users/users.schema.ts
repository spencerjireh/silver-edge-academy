import { z } from 'zod'
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  PASSWORD_MIN_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
} from '@silveredge/shared'

const roleSchema = z.enum(['admin', 'teacher', 'parent', 'student'])
const statusSchema = z.enum(['active', 'inactive'])

export const createUserSchema = z
  .object({
    email: z.string().email().optional(),
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH)
      .max(USERNAME_MAX_LENGTH)
      .regex(USERNAME_PATTERN, 'Username can only contain letters, numbers, and underscores')
      .optional(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    displayName: z.string().min(DISPLAY_NAME_MIN_LENGTH).max(DISPLAY_NAME_MAX_LENGTH),
    role: roleSchema,
    status: statusSchema.optional(),
    // Student-specific
    classId: z.string().optional(),
    parentIds: z.array(z.string()).optional(),
    // Teacher-specific
    classIds: z.array(z.string()).optional(),
    // Parent-specific
    childIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'student') {
        return data.username !== undefined
      }
      return data.email !== undefined
    },
    {
      message: 'Students require username, others require email',
      path: ['email'],
    }
  )

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(DISPLAY_NAME_MIN_LENGTH).max(DISPLAY_NAME_MAX_LENGTH).optional(),
  avatarId: z.string().nullable().optional(),
  status: statusSchema.optional(),
  // Student-specific
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH)
    .regex(USERNAME_PATTERN)
    .optional(),
  classId: z.string().nullable().optional(),
  parentIds: z.array(z.string()).optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      editorTheme: z.string().optional(),
      fontSize: z.number().min(10).max(24).optional(),
    })
    .optional(),
  // Parent-specific
  childIds: z.array(z.string()).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH),
})

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  search: z.string().optional(),
  classId: z.string().optional(),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const updateUserStatusSchema = z.object({
  status: statusSchema,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>
