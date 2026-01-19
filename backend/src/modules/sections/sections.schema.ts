import { z } from 'zod'
import { SECTION_TITLE_MAX_LENGTH } from '@silveredge/shared'

export const createSectionSchema = z.object({
  title: z.string().min(1).max(SECTION_TITLE_MAX_LENGTH),
  description: z.string().optional(),
  orderIndex: z.number().min(0).optional(),
})

export const updateSectionSchema = z.object({
  title: z.string().min(1).max(SECTION_TITLE_MAX_LENGTH).optional(),
  description: z.string().optional(),
  orderIndex: z.number().min(0).optional(),
})

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string()).min(1),
})

export const courseIdParamSchema = z.object({
  courseId: z.string().min(1),
})

export const sectionIdParamSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().min(1),
})

export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>
