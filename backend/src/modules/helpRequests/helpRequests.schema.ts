import { z } from 'zod'

export const createHelpRequestSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  exerciseId: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  codeSnapshot: z.string().max(10000).optional(),
})
export type CreateHelpRequestInput = z.infer<typeof createHelpRequestSchema>

export const respondHelpRequestSchema = z.object({
  response: z.string().min(1, 'Response is required').max(5000),
  status: z.enum(['in_progress', 'resolved', 'closed']).optional(),
})
export type RespondHelpRequestInput = z.infer<typeof respondHelpRequestSchema>

export const assignHelpRequestSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
})
export type AssignHelpRequestInput = z.infer<typeof assignHelpRequestSchema>

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']),
})
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

export const helpRequestIdParamSchema = z.object({
  requestId: z.string().min(1),
})
export type HelpRequestIdParam = z.infer<typeof helpRequestIdParamSchema>

export const listHelpRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
  classId: z.string().optional(),
})
export type ListHelpRequestsQuery = z.infer<typeof listHelpRequestsQuerySchema>
