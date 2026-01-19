import { z } from 'zod'

export const studentIdParamSchema = z.object({
  id: z.string().min(1),
})

export const courseIdParamSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
})

export const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
})

export const updateTimeSpentSchema = z.object({
  timeSpentSeconds: z.number().min(0),
})

export type UpdateTimeSpentInput = z.infer<typeof updateTimeSpentSchema>
