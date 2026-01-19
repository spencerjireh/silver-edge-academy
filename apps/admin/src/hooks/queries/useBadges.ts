import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBadges,
  getBadge,
  createBadge,
  updateBadge,
  deleteBadge,
  getBadgeEarnedStudents,
  type CreateBadgePayload,
  type UpdateBadgePayload,
} from '@/services/api/badges'

export const badgeKeys = {
  all: ['badges'] as const,
  lists: () => [...badgeKeys.all, 'list'] as const,
  list: () => [...badgeKeys.lists()] as const,
  details: () => [...badgeKeys.all, 'detail'] as const,
  detail: (id: string) => [...badgeKeys.details(), id] as const,
  earnedStudents: (id: string) => [...badgeKeys.detail(id), 'earned-students'] as const,
}

export function useBadges() {
  return useQuery({
    queryKey: badgeKeys.list(),
    queryFn: () => getBadges(),
  })
}

export function useBadge(id: string) {
  return useQuery({
    queryKey: badgeKeys.detail(id),
    queryFn: () => getBadge(id),
    enabled: !!id,
  })
}

export function useCreateBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBadgePayload) => createBadge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.lists() })
    },
  })
}

export function useUpdateBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBadgePayload) => updateBadge(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: badgeKeys.detail(variables.id) })
    },
  })
}

export function useDeleteBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBadge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.lists() })
    },
  })
}

export function useBadgeEarnedStudents(badgeId: string) {
  return useQuery({
    queryKey: badgeKeys.earnedStudents(badgeId),
    queryFn: () => getBadgeEarnedStudents(badgeId),
    enabled: !!badgeId,
  })
}
