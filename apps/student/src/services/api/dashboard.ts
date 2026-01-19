import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { DashboardData } from '@/types/student'

/**
 * Get student dashboard data
 */
export async function getDashboard(): Promise<DashboardData> {
  return api.get<DashboardData>(STUDENT_ENDPOINTS.dashboard)
}
