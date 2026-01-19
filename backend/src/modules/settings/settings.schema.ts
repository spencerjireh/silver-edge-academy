import { z } from 'zod'

export const updateGamificationSchema = z.object({
  xpPerLesson: z.number().int().min(0).optional(),
  xpPerExercise: z.number().int().min(0).optional(),
  xpPerQuiz: z.number().int().min(0).optional(),
  xpPerStreak: z.number().int().min(0).optional(),
  levelBaseXp: z.number().int().min(1).optional(),
  levelMultiplier: z.number().min(1).optional(),
})

export const updateFeatureSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
})

export const updateFeaturesSchema = z.array(updateFeatureSchema)

export const updateSingleFeatureSchema = z.object({
  enabled: z.boolean(),
})

export const updateSystemSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  maxFileUploadSize: z.number().int().min(1).max(500).optional(),
})

export type UpdateGamificationInput = z.infer<typeof updateGamificationSchema>
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>
export type UpdateFeaturesInput = z.infer<typeof updateFeaturesSchema>
export type UpdateSingleFeatureInput = z.infer<typeof updateSingleFeatureSchema>
export type UpdateSystemInput = z.infer<typeof updateSystemSchema>
