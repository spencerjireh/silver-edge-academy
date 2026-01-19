import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  language: z.enum(['javascript', 'python']).default('javascript'),
  code: z.string().max(50000).optional().default(''),
})
export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  code: z.string().max(50000).optional(),
})
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1),
})
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  language: z.enum(['javascript', 'python']).optional(),
})
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>
