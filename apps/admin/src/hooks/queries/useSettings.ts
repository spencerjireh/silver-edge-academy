import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGamificationSettings,
  updateGamificationSettings,
  getFeatureToggles,
  updateFeatureToggle,
  batchUpdateFeatures,
  getSystemSettings,
  updateSystemSettings,
  getStorageInfo,
  type GamificationSettings,
  type FeatureKey,
  type FeatureToggles,
  type SystemSettings,
} from '@/services/api/settings'

export const settingsKeys = {
  all: ['settings'] as const,
  gamification: () => [...settingsKeys.all, 'gamification'] as const,
  features: () => [...settingsKeys.all, 'features'] as const,
  system: () => [...settingsKeys.all, 'system'] as const,
  storage: () => [...settingsKeys.all, 'storage'] as const,
}

// Gamification
export function useGamificationSettings() {
  return useQuery({
    queryKey: settingsKeys.gamification(),
    queryFn: getGamificationSettings,
  })
}

export function useUpdateGamificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<GamificationSettings>) => updateGamificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.gamification() })
    },
  })
}

// Features
export function useFeatureToggles() {
  return useQuery({
    queryKey: settingsKeys.features(),
    queryFn: getFeatureToggles,
  })
}

export function useUpdateFeatureToggle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, enabled }: { key: FeatureKey; enabled: boolean }) =>
      updateFeatureToggle(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.features() })
    },
  })
}

export function useBatchUpdateFeatures() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (features: FeatureToggles) => batchUpdateFeatures(features),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.features() })
    },
  })
}

// System
export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn: getSystemSettings,
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => updateSystemSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.system() })
    },
  })
}

// Storage
export function useStorageInfo() {
  return useQuery({
    queryKey: settingsKeys.storage(),
    queryFn: getStorageInfo,
  })
}
