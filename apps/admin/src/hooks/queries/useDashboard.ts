import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/services/api/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  recentlyViewed: () => [...dashboardKeys.all, 'recently-viewed'] as const,
  courseCompletion: () => [...dashboardKeys.all, 'course-completion'] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardApi.getStats,
  })
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: dashboardApi.getActivity,
  })
}

export function useRecentlyViewed() {
  return useQuery({
    queryKey: dashboardKeys.recentlyViewed(),
    queryFn: dashboardApi.getRecentlyViewed,
  })
}

export function useCourseCompletion() {
  return useQuery({
    queryKey: dashboardKeys.courseCompletion(),
    queryFn: dashboardApi.getCourseCompletion,
  })
}
