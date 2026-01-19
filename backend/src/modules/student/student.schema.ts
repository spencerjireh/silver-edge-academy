import { z } from 'zod'

// ============================================================================
// Auth Schemas
// ============================================================================

export const studentLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
export type StudentLoginInput = z.infer<typeof studentLoginSchema>

export const studentLogoutSchema = z.object({
  refreshToken: z.string().optional(),
})
export type StudentLogoutInput = z.infer<typeof studentLogoutSchema>

// ============================================================================
// Profile Schemas
// ============================================================================

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarId: z.string().nullable().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      editorTheme: z.string().optional(),
      fontSize: z.number().min(10).max(24).optional(),
    })
    .optional(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ============================================================================
// Course/Lesson Schemas
// ============================================================================

export const courseIdParamSchema = z.object({
  courseId: z.string().min(1),
})
export type CourseIdParam = z.infer<typeof courseIdParamSchema>

export const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
})
export type LessonIdParam = z.infer<typeof lessonIdParamSchema>

export const exerciseIdParamSchema = z.object({
  exerciseId: z.string().min(1),
})
export type ExerciseIdParam = z.infer<typeof exerciseIdParamSchema>

export const quizIdParamSchema = z.object({
  quizId: z.string().min(1),
})
export type QuizIdParam = z.infer<typeof quizIdParamSchema>

// ============================================================================
// Exercise/Quiz Submission Schemas
// ============================================================================

export const submitExerciseSchema = z.object({
  code: z.string(),
})
export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(0),
    })
  ),
})
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>

// ============================================================================
// Shop Schemas
// ============================================================================

export const purchaseItemSchema = z.object({
  itemId: z.string().min(1),
})
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>

export const equipItemSchema = z.object({
  itemId: z.string().min(1),
  slot: z.enum(['avatar', 'uiTheme', 'editorTheme']),
})
export type EquipItemInput = z.infer<typeof equipItemSchema>

// ============================================================================
// Pagination/Query Schemas
// ============================================================================

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})
export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const xpHistoryQuerySchema = paginationQuerySchema.extend({
  actionType: z
    .enum([
      'lesson_complete',
      'exercise_complete',
      'quiz_complete',
      'daily_login',
      'streak_bonus',
      'badge_earned',
    ])
    .optional(),
})
export type XpHistoryQuery = z.infer<typeof xpHistoryQuerySchema>

// ============================================================================
// Notification Schemas
// ============================================================================

export const notificationIdParamSchema = z.object({
  notificationId: z.string().min(1),
})
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>
