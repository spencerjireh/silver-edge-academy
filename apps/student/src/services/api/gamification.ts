import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'

// ============================================================================
// Types
// ============================================================================

export interface StudentBadge {
  id: string
  name: string
  description: string
  iconUrl: string
  category: string
  xpRequired?: number
  isEarned: boolean
  earnedAt?: string
}

export interface XpHistoryItem {
  id: string
  amount: number
  actionType: string
  sourceId?: string
  description?: string
  createdAt: string
}

export interface XpHistoryResponse {
  data: XpHistoryItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all badges with earned status
 */
export async function getBadges(): Promise<StudentBadge[]> {
  return api.get<StudentBadge[]>(STUDENT_ENDPOINTS.badges)
}

/**
 * Get XP transaction history
 */
export async function getXpHistory(params?: {
  page?: number
  limit?: number
  actionType?: string
}): Promise<XpHistoryResponse> {
  return api.get<XpHistoryResponse>(STUDENT_ENDPOINTS.xpHistory, {
    params,
    unwrapData: false, // Keep the full response with meta
  })
}
