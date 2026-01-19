import type {
  DashboardStats,
  ActivityData,
  RecentItem,
  CourseCompletion,
} from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type { DashboardStats, ActivityData, RecentItem, CourseCompletion }

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> => {
    return api.get<DashboardStats>(API_ENDPOINTS.dashboard.stats)
  },

  getActivity: (): Promise<ActivityData[]> => {
    return api.get<ActivityData[]>(API_ENDPOINTS.dashboard.activity)
  },

  getRecentlyViewed: (): Promise<RecentItem[]> => {
    return api.get<RecentItem[]>(API_ENDPOINTS.dashboard.recentlyViewed)
  },

  getCourseCompletion: (): Promise<CourseCompletion> => {
    return api.get<CourseCompletion>(API_ENDPOINTS.dashboard.courseCompletion)
  },
}
