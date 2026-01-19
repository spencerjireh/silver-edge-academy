import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess } from '../../utils/ApiResponse'
import * as settingsService from './settings.service'
import type {
  UpdateGamificationInput,
  UpdateFeaturesInput,
  UpdateSingleFeatureInput,
  UpdateSystemInput,
} from './settings.schema'

export const getGamification = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getGamificationSettings()
  sendSuccess(res, settings)
})

export const updateGamification = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateGamificationInput
  const settings = await settingsService.updateGamificationSettings(input)
  sendSuccess(res, settings)
})

export const getFeatures = asyncHandler(async (_req: Request, res: Response) => {
  const features = await settingsService.getFeatures()
  sendSuccess(res, features)
})

export const updateFeatures = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateFeaturesInput
  const features = await settingsService.updateFeatures(input)
  sendSuccess(res, features)
})

export const updateSingleFeature = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params
  const { enabled } = req.body as UpdateSingleFeatureInput
  const features = await settingsService.updateSingleFeature(key, enabled)
  sendSuccess(res, features)
})

export const getSystem = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSystemSettings()
  sendSuccess(res, settings)
})

export const updateSystem = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateSystemInput
  const settings = await settingsService.updateSystemSettings(input)
  sendSuccess(res, settings)
})

export const getStorage = asyncHandler(async (_req: Request, res: Response) => {
  const storageInfo = await settingsService.getStorageInfo()
  sendSuccess(res, storageInfo)
})

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getAllSettings()
  sendSuccess(res, settings.toJSON())
})
