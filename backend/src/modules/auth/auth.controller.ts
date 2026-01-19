import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess } from '../../utils/ApiResponse'
import * as authService from './auth.service'
import type { LoginInput, RefreshInput } from './auth.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput
  const result = await authService.login(input)

  sendSuccess(res, {
    ...result.user.user.toJSON(),
    ...result.user.profile,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  })
})

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshInput
  const tokens = await authService.refresh(refreshToken)
  sendSuccess(res, tokens)
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshInput
  await authService.logout(refreshToken)
  sendSuccess(res, { message: 'Logged out successfully' })
})

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  await authService.logoutAll(authReq.user.userId)
  sendSuccess(res, { message: 'Logged out from all devices' })
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const result = await authService.getCurrentUser(authReq.user.userId)
  sendSuccess(res, {
    ...result.user.toJSON(),
    ...result.profile,
  })
})
