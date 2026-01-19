import type {
  GamificationSettings,
  FeatureToggle,
  SystemSettings,
  StorageInfo,
} from '@silveredge/shared'
import { getSettingsDocument, type ISettings, type IFeatureToggle } from './settings.model'
import type {
  UpdateGamificationInput,
  UpdateFeaturesInput,
  UpdateSystemInput,
} from './settings.schema'

export async function getGamificationSettings(): Promise<GamificationSettings> {
  const settings = await getSettingsDocument()
  return {
    xpPerLesson: settings.gamification.xpPerLesson,
    xpPerExercise: settings.gamification.xpPerExercise,
    xpPerQuiz: settings.gamification.xpPerQuiz,
    xpPerStreak: settings.gamification.xpPerStreak,
    levelBaseXp: settings.gamification.levelBaseXp,
    levelMultiplier: settings.gamification.levelMultiplier,
  }
}

export async function updateGamificationSettings(
  input: UpdateGamificationInput
): Promise<GamificationSettings> {
  const settings = await getSettingsDocument()

  if (input.xpPerLesson !== undefined) {
    settings.gamification.xpPerLesson = input.xpPerLesson
  }
  if (input.xpPerExercise !== undefined) {
    settings.gamification.xpPerExercise = input.xpPerExercise
  }
  if (input.xpPerQuiz !== undefined) {
    settings.gamification.xpPerQuiz = input.xpPerQuiz
  }
  if (input.xpPerStreak !== undefined) {
    settings.gamification.xpPerStreak = input.xpPerStreak
  }
  if (input.levelBaseXp !== undefined) {
    settings.gamification.levelBaseXp = input.levelBaseXp
  }
  if (input.levelMultiplier !== undefined) {
    settings.gamification.levelMultiplier = input.levelMultiplier
  }

  await settings.save()

  return {
    xpPerLesson: settings.gamification.xpPerLesson,
    xpPerExercise: settings.gamification.xpPerExercise,
    xpPerQuiz: settings.gamification.xpPerQuiz,
    xpPerStreak: settings.gamification.xpPerStreak,
    levelBaseXp: settings.gamification.levelBaseXp,
    levelMultiplier: settings.gamification.levelMultiplier,
  }
}

export async function getFeatures(): Promise<FeatureToggle[]> {
  const settings = await getSettingsDocument()
  return settings.features.map((f: IFeatureToggle) => ({
    key: f.key,
    enabled: f.enabled,
    description: f.description,
  }))
}

export async function updateFeatures(input: UpdateFeaturesInput): Promise<FeatureToggle[]> {
  const settings = await getSettingsDocument()

  for (const update of input) {
    const feature = settings.features.find((f: IFeatureToggle) => f.key === update.key)
    if (feature) {
      feature.enabled = update.enabled
    }
  }

  await settings.save()

  return settings.features.map((f: IFeatureToggle) => ({
    key: f.key,
    enabled: f.enabled,
    description: f.description,
  }))
}

export async function updateSingleFeature(
  key: string,
  enabled: boolean
): Promise<FeatureToggle[]> {
  const settings = await getSettingsDocument()

  const feature = settings.features.find((f: IFeatureToggle) => f.key === key)
  if (!feature) {
    throw new Error(`Feature '${key}' not found`)
  }

  feature.enabled = enabled
  await settings.save()

  return settings.features.map((f: IFeatureToggle) => ({
    key: f.key,
    enabled: f.enabled,
    description: f.description,
  }))
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const settings = await getSettingsDocument()
  return {
    maintenanceMode: settings.system.maintenanceMode,
    allowRegistration: settings.system.allowRegistration,
    maxFileUploadSize: settings.system.maxFileUploadSize,
  }
}

export async function updateSystemSettings(input: UpdateSystemInput): Promise<SystemSettings> {
  const settings = await getSettingsDocument()

  if (input.maintenanceMode !== undefined) {
    settings.system.maintenanceMode = input.maintenanceMode
  }
  if (input.allowRegistration !== undefined) {
    settings.system.allowRegistration = input.allowRegistration
  }
  if (input.maxFileUploadSize !== undefined) {
    settings.system.maxFileUploadSize = input.maxFileUploadSize
  }

  await settings.save()

  return {
    maintenanceMode: settings.system.maintenanceMode,
    allowRegistration: settings.system.allowRegistration,
    maxFileUploadSize: settings.system.maxFileUploadSize,
  }
}

export async function getStorageInfo(): Promise<StorageInfo> {
  // This would typically query MinIO for actual storage usage
  // For now, return mock/placeholder data
  // In production, integrate with MinIO client to get bucket stats
  try {
    // Placeholder - in a real implementation, query MinIO
    return {
      used: 0,
      total: 10 * 1024 * 1024 * 1024, // 10GB default
      fileCount: 0,
    }
  } catch {
    return {
      used: 0,
      total: 10 * 1024 * 1024 * 1024,
      fileCount: 0,
    }
  }
}

export async function getAllSettings(): Promise<ISettings> {
  return await getSettingsDocument()
}
