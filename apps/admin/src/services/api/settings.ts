import type {
  GamificationSettings,
  FeatureToggles,
  FeatureKey,
  FeatureInfo,
  SystemSettings,
  StorageInfo,
} from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type {
  GamificationSettings,
  FeatureToggles,
  FeatureKey,
  FeatureInfo,
  SystemSettings,
  StorageInfo,
}

export const featureList: FeatureInfo[] = [
  {
    key: 'sandboxMode',
    name: 'Sandbox Mode',
    description: 'Allow students to use free-form coding sandbox',
    icon: 'code',
    color: 'accent',
  },
  {
    key: 'visualCoding',
    name: 'Visual Coding (Blockly)',
    description: 'Enable drag-and-drop block programming for lessons',
    icon: 'puzzle',
    color: 'amber',
  },
  {
    key: 'canvasGraphics',
    name: 'Canvas Graphics',
    description: 'Enable HTML5 canvas API for graphical output in exercises',
    icon: 'palette',
    color: 'rose',
  },
  {
    key: 'helpRequests',
    name: 'Student Help Requests',
    description: 'Allow students to request help from teachers while stuck',
    icon: 'help-circle',
    color: 'sky',
  },
  {
    key: 'loginStreaks',
    name: 'Login Streaks',
    description: 'Track and display consecutive login days for students',
    icon: 'flame',
    color: 'orange',
  },
]

// ============================================================================
// Backend Type Definitions
// ============================================================================

interface BackendGamificationSettings {
  xpPerLesson: number
  xpPerExercise: number
  xpPerQuiz: number
  xpPerStreak: number
  levelBaseXp: number
  levelMultiplier: number
}

interface BackendFeature {
  key: string
  enabled: boolean
  description?: string
}

interface BackendSystemSettings {
  maintenanceMode: boolean
  allowRegistration: boolean
  maxFileUploadSize: number
}

interface BackendStorageInfo {
  used: number
  total: number
  fileCount: number
}

// ============================================================================
// Transform Functions
// ============================================================================

function backendToFrontendGamification(backend: BackendGamificationSettings): GamificationSettings {
  return {
    xp: {
      lessonCompletion: backend.xpPerLesson,
      exercisePass: backend.xpPerExercise,
      quizBasePoints: backend.xpPerQuiz,
    },
    currency: {
      coinsPerXp: 1,
    },
    levelProgression: {
      baseXp: backend.levelBaseXp,
      growthMultiplier: backend.levelMultiplier,
      overrides: [],
    },
    streaksEnabled: backend.xpPerStreak > 0,
  }
}

function frontendToBackendGamification(
  frontend: Partial<GamificationSettings>
): Partial<BackendGamificationSettings> {
  const backend: Partial<BackendGamificationSettings> = {}
  if (frontend.xp?.lessonCompletion !== undefined) {
    backend.xpPerLesson = frontend.xp.lessonCompletion
  }
  if (frontend.xp?.exercisePass !== undefined) {
    backend.xpPerExercise = frontend.xp.exercisePass
  }
  if (frontend.xp?.quizBasePoints !== undefined) {
    backend.xpPerQuiz = frontend.xp.quizBasePoints
  }
  if (frontend.levelProgression?.baseXp !== undefined) {
    backend.levelBaseXp = frontend.levelProgression.baseXp
  }
  if (frontend.levelProgression?.growthMultiplier !== undefined) {
    backend.levelMultiplier = frontend.levelProgression.growthMultiplier
  }
  return backend
}

function arrayToFeatureToggles(arr: BackendFeature[]): FeatureToggles {
  const result = {} as FeatureToggles
  for (const feature of arr) {
    result[feature.key as FeatureKey] = feature.enabled
  }
  return result
}

function backendToFrontendSystem(backend: BackendSystemSettings): SystemSettings {
  return {
    codeExecution: {
      timeoutSeconds: 30,
      maxOutputLength: 10000,
    },
    fileUpload: {
      maxFileSizeMb: backend.maxFileUploadSize,
      maxVideoDurationMinutes: 10,
      allowedTypes: ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'application/pdf'],
    },
    session: {
      timeoutMinutes: 60,
      refreshTokenDays: 7,
    },
    editor: {
      defaultMode: 'text',
      defaultComplexity: 'standard',
      fontSize: 14,
    },
  }
}

function frontendToBackendSystem(
  frontend: Partial<SystemSettings>
): Partial<BackendSystemSettings> {
  const backend: Partial<BackendSystemSettings> = {}
  if (frontend.fileUpload?.maxFileSizeMb !== undefined) {
    backend.maxFileUploadSize = frontend.fileUpload.maxFileSizeMb
  }
  return backend
}

function backendToFrontendStorage(backend: BackendStorageInfo): StorageInfo {
  return {
    used: backend.used,
    total: backend.total,
    breakdown: {
      lessonMedia: Math.round(backend.used * 0.6),
      sandbox: Math.round(backend.used * 0.3),
      database: Math.round(backend.used * 0.1),
    },
  }
}

// ============================================================================
// API Functions
// ============================================================================

// Gamification
export async function getGamificationSettings(): Promise<GamificationSettings> {
  const backendSettings = await api.get<BackendGamificationSettings>(
    API_ENDPOINTS.settings.gamification
  )
  return backendToFrontendGamification(backendSettings)
}

export async function updateGamificationSettings(
  settings: Partial<GamificationSettings>
): Promise<GamificationSettings> {
  const backendPayload = frontendToBackendGamification(settings)
  const backendSettings = await api.patch<BackendGamificationSettings>(
    API_ENDPOINTS.settings.gamification,
    backendPayload
  )
  return backendToFrontendGamification(backendSettings)
}

// Features
export async function getFeatureToggles(): Promise<FeatureToggles> {
  const featuresArray = await api.get<BackendFeature[]>(API_ENDPOINTS.settings.features)
  return arrayToFeatureToggles(featuresArray)
}

export async function updateFeatureToggle(
  key: FeatureKey,
  enabled: boolean
): Promise<FeatureToggles> {
  const featuresArray = await api.patch<BackendFeature[]>(
    API_ENDPOINTS.settings.featureToggle(key),
    { enabled }
  )
  return arrayToFeatureToggles(featuresArray)
}

export async function batchUpdateFeatures(
  features: FeatureToggles
): Promise<FeatureToggles> {
  const requestArray = Object.entries(features).map(([key, enabled]) => ({
    key,
    enabled,
  }))
  const responseArray = await api.patch<BackendFeature[]>(
    API_ENDPOINTS.settings.features,
    requestArray
  )
  return arrayToFeatureToggles(responseArray)
}

// System
export async function getSystemSettings(): Promise<SystemSettings> {
  const backendSettings = await api.get<BackendSystemSettings>(API_ENDPOINTS.settings.system)
  return backendToFrontendSystem(backendSettings)
}

export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<SystemSettings> {
  const backendPayload = frontendToBackendSystem(settings)
  const backendSettings = await api.patch<BackendSystemSettings>(
    API_ENDPOINTS.settings.system,
    backendPayload
  )
  return backendToFrontendSystem(backendSettings)
}

// Storage
export async function getStorageInfo(): Promise<StorageInfo> {
  const backendStorage = await api.get<BackendStorageInfo>(API_ENDPOINTS.settings.storage)
  return backendToFrontendStorage(backendStorage)
}
