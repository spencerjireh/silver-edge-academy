import type { BadgeTriggerType } from '@silveredge/shared'
import type {
  AdminBadge,
  BadgeIcon,
  BadgeColor,
  BadgeEarnedStudent,
} from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type { AdminBadge as Badge, BadgeIcon, BadgeColor, BadgeEarnedStudent }
export type TriggerType = BadgeTriggerType
export { badgeColorGradients } from '@/types/admin'

export interface CreateBadgePayload {
  name: string
  description: string
  icon: BadgeIcon
  color: BadgeColor
  gradientFrom: string
  gradientTo: string
  triggerType: BadgeTriggerType
  triggerValue?: number
  status: 'active' | 'inactive'
}

export interface UpdateBadgePayload extends Partial<CreateBadgePayload> {
  id: string
}

export async function getBadges(): Promise<AdminBadge[]> {
  return api.get<AdminBadge[]>(API_ENDPOINTS.badges.list)
}

export async function getBadge(id: string): Promise<AdminBadge> {
  return api.get<AdminBadge>(API_ENDPOINTS.badges.detail(id))
}

export async function createBadge(payload: CreateBadgePayload): Promise<AdminBadge> {
  return api.post<AdminBadge>(API_ENDPOINTS.badges.create, payload)
}

export async function updateBadge(payload: UpdateBadgePayload): Promise<AdminBadge> {
  const { id, ...data } = payload
  return api.patch<AdminBadge>(API_ENDPOINTS.badges.update(id), data)
}

export async function deleteBadge(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.badges.delete(id))
}

export async function getBadgeEarnedStudents(badgeId: string): Promise<BadgeEarnedStudent[]> {
  return api.get<BadgeEarnedStudent[]>(API_ENDPOINTS.badges.earnedStudents(badgeId))
}
