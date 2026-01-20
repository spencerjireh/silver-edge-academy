import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { SandboxProject } from '@/types/student'

// ============================================================================
// Types
// ============================================================================

export interface SandboxListResponse {
  projects: SandboxProject[]
  count: number
  maxProjects: number
}

export type SandboxProjectResponse = SandboxProject

export interface CreateSandboxProjectInput {
  name: string
  description?: string
  language: 'javascript' | 'python'
  code?: string
}

export interface UpdateSandboxProjectInput {
  name?: string
  description?: string
  code?: string
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of sandbox projects
 */
export async function getSandboxProjects(params?: {
  page?: number
  limit?: number
  language?: 'javascript' | 'python'
}): Promise<SandboxListResponse> {
  const response = await api.get<{ data: SandboxProject[]; meta: { total: number; page: number; limit: number; totalPages: number; maxProjects: number } }>(
    STUDENT_ENDPOINTS.sandbox.list,
    { params, unwrapData: false }
  )
  return {
    projects: response.data,
    count: response.meta.total,
    maxProjects: response.meta.maxProjects,
  }
}

/**
 * Get a sandbox project by ID
 */
export async function getSandboxProject(projectId: string): Promise<SandboxProjectResponse> {
  return api.get<SandboxProjectResponse>(STUDENT_ENDPOINTS.sandbox.detail(projectId))
}

/**
 * Create a new sandbox project
 */
export async function createSandboxProject(data: CreateSandboxProjectInput): Promise<SandboxProject> {
  return api.post<SandboxProject>(STUDENT_ENDPOINTS.sandbox.create, data)
}

/**
 * Update a sandbox project
 */
export async function updateSandboxProject(
  projectId: string,
  data: UpdateSandboxProjectInput
): Promise<SandboxProject> {
  return api.patch<SandboxProject>(STUDENT_ENDPOINTS.sandbox.detail(projectId), data)
}

/**
 * Delete a sandbox project
 */
export async function deleteSandboxProject(projectId: string): Promise<void> {
  return api.delete(STUDENT_ENDPOINTS.sandbox.detail(projectId))
}
