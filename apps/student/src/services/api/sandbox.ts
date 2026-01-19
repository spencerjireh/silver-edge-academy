import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { SandboxProject } from '@/types/student'

// ============================================================================
// Types
// ============================================================================

export interface SandboxListResponse {
  data: SandboxProject[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

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
  return api.get<SandboxListResponse>(STUDENT_ENDPOINTS.sandbox.list, {
    params,
    unwrapData: false,
  })
}

/**
 * Get a sandbox project by ID
 */
export async function getSandboxProject(projectId: string): Promise<SandboxProject> {
  return api.get<SandboxProject>(STUDENT_ENDPOINTS.sandbox.detail(projectId))
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
