import { z } from 'zod'
import {
  LESSON_TITLE_MAX_LENGTH,
  LESSON_CONTENT_MAX_LENGTH,
  CODE_MAX_LENGTH,
} from '@silveredge/shared'

export const createLessonSchema = z.object({
  title: z.string().min(1).max(LESSON_TITLE_MAX_LENGTH),
  content: z.string().max(LESSON_CONTENT_MAX_LENGTH).optional(),
  orderIndex: z.number().min(0).optional(),
  status: z.enum(['draft', 'published']).optional(),
  codeMode: z.enum(['visual', 'text', 'mixed']).optional(),
  editorComplexity: z.enum(['simplified', 'standard', 'advanced']).optional(),
  starterCode: z.string().max(CODE_MAX_LENGTH).optional(),
  duration: z.number().min(1).optional(),
  xpReward: z.number().min(0).optional(),
})

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(LESSON_TITLE_MAX_LENGTH).optional(),
  content: z.string().max(LESSON_CONTENT_MAX_LENGTH).optional(),
  orderIndex: z.number().min(0).optional(),
  status: z.enum(['draft', 'published']).optional(),
  codeMode: z.enum(['visual', 'text', 'mixed']).optional(),
  editorComplexity: z.enum(['simplified', 'standard', 'advanced']).optional(),
  starterCode: z.string().max(CODE_MAX_LENGTH).optional(),
  duration: z.number().min(1).optional(),
  xpReward: z.number().min(0).optional(),
})

export const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string()).min(1),
})

export const sectionIdParamSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().min(1),
})

export const lessonIdParamSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().min(1),
  lessonId: z.string().min(1),
})

export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>
