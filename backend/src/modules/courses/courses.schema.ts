import { z } from 'zod'
import { COURSE_TITLE_MAX_LENGTH, COURSE_DESCRIPTION_MAX_LENGTH } from '@silveredge/shared'

export const createCourseSchema = z.object({
  title: z.string().min(1).max(COURSE_TITLE_MAX_LENGTH),
  description: z.string().max(COURSE_DESCRIPTION_MAX_LENGTH).optional(),
  language: z.enum(['javascript', 'python']),
  status: z.enum(['draft', 'published']).optional(),
})

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(COURSE_TITLE_MAX_LENGTH).optional(),
  description: z.string().max(COURSE_DESCRIPTION_MAX_LENGTH).optional(),
  language: z.enum(['javascript', 'python']).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['draft', 'published']).optional(),
  language: z.enum(['javascript', 'python']).optional(),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>
