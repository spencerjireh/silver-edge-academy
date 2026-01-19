import { Schema, model, Document } from 'mongoose'
import { toJSONOptions } from '../../utils/mongoose'
import {
  DEFAULT_XP_VALUES,
  LEVEL_BASE_XP,
  LEVEL_MULTIPLIER,
  MAX_FILE_SIZE_MB,
} from '@silveredge/shared'

export interface IGamificationSettings {
  xpPerLesson: number
  xpPerExercise: number
  xpPerQuiz: number
  xpPerStreak: number
  levelBaseXp: number
  levelMultiplier: number
}

export interface IFeatureToggle {
  key: string
  enabled: boolean
  description: string
}

export interface ISystemSettings {
  maintenanceMode: boolean
  allowRegistration: boolean
  maxFileUploadSize: number
}

export interface ISettings extends Document {
  gamification: IGamificationSettings
  features: IFeatureToggle[]
  system: ISystemSettings
  createdAt: Date
  updatedAt: Date
}

const featureToggleSchema = new Schema<IFeatureToggle>(
  {
    key: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  { _id: false }
)

const settingsSchema = new Schema<ISettings>(
  {
    gamification: {
      xpPerLesson: { type: Number, default: DEFAULT_XP_VALUES.lessonComplete },
      xpPerExercise: { type: Number, default: DEFAULT_XP_VALUES.exerciseComplete },
      xpPerQuiz: { type: Number, default: DEFAULT_XP_VALUES.perfectQuiz },
      xpPerStreak: { type: Number, default: DEFAULT_XP_VALUES.streakBonus },
      levelBaseXp: { type: Number, default: LEVEL_BASE_XP },
      levelMultiplier: { type: Number, default: LEVEL_MULTIPLIER },
    },
    features: {
      type: [featureToggleSchema],
      default: [
        { key: 'sandboxMode', enabled: true, description: 'Allow students to use free-form coding sandbox' },
        { key: 'visualCoding', enabled: true, description: 'Enable drag-and-drop block programming for lessons' },
        { key: 'canvasGraphics', enabled: true, description: 'Enable HTML5 canvas API for graphical output in exercises' },
        { key: 'helpRequests', enabled: true, description: 'Allow students to request help from teachers while stuck' },
        { key: 'loginStreaks', enabled: true, description: 'Track and display consecutive login days for students' },
      ],
    },
    system: {
      maintenanceMode: { type: Boolean, default: false },
      allowRegistration: { type: Boolean, default: true },
      maxFileUploadSize: { type: Number, default: MAX_FILE_SIZE_MB },
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

export const Settings = model<ISettings>('Settings', settingsSchema)

// Helper to get or create singleton settings document
export async function getSettingsDocument(): Promise<ISettings> {
  let settings = await Settings.findOne()
  if (!settings) {
    settings = await Settings.create({})
  }
  return settings
}
