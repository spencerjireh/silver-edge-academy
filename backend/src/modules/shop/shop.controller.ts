import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as shopService from './shop.service'
import type { AuthenticatedRequest } from '../../middleware/auth'
import type { CreateShopItemInput, UpdateShopItemInput, ListShopItemsQuery } from './shop.schema'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListShopItemsQuery
  const result = await shopService.listShopItems(query)
  sendPaginated(res, result.items.map((i) => i.toJSON()), result.meta)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const item = await shopService.getShopItemById(req.params.id)
  sendSuccess(res, item.toJSON())
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as CreateShopItemInput
  const item = await shopService.createShopItem(input, authReq.user.userId)
  sendCreated(res, item.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateShopItemInput
  const item = await shopService.updateShopItem(req.params.id, input)
  sendSuccess(res, item.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await shopService.deleteShopItem(req.params.id)
  sendNoContent(res)
})

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  const item = await shopService.toggleItemActive(req.params.id)
  sendSuccess(res, item.toJSON())
})

export const purchase = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  await shopService.purchaseItem(req.params.id, authReq.user.userId)
  sendSuccess(res, { message: 'Item purchased successfully' })
})

export const getMyPurchases = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const purchases = await shopService.getStudentPurchases(authReq.user.userId)
  sendSuccess(res, purchases)
})
