import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { StudentHelpRequest } from '@/types/student'

// ============================================================================
// Types
// ============================================================================

export interface HelpRequestsListResponse {
  data: StudentHelpRequest[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateHelpRequestInput {
  lessonId: string
  exerciseId?: string
  message: string
  codeSnapshot?: string
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of help requests
 */
export async function getHelpRequests(params?: {
  page?: number
  limit?: number
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
}): Promise<HelpRequestsListResponse> {
  return api.get<HelpRequestsListResponse>(STUDENT_ENDPOINTS.helpRequests.list, {
    params,
    unwrapData: false,
  })
}

/**
 * Get a help request by ID
 */
export async function getHelpRequest(requestId: string): Promise<StudentHelpRequest> {
  return api.get<StudentHelpRequest>(STUDENT_ENDPOINTS.helpRequests.detail(requestId))
}

/**
 * Create a new help request
 */
export async function createHelpRequest(data: CreateHelpRequestInput): Promise<StudentHelpRequest> {
  return api.post<StudentHelpRequest>(STUDENT_ENDPOINTS.helpRequests.create, data)
}
