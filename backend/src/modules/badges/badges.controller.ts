import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as badgesService from './badges.service'
import type { CreateBadgeInput, UpdateBadgeInput, ListBadgesQuery } from './badges.schema'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListBadgesQuery
  const result = await badgesService.listBadges(query)
  sendPaginated(res, result.badges.map((b) => b.toJSON()), result.meta)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const badge = await badgesService.getBadgeById(req.params.id)
  sendSuccess(res, badge.toJSON())
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateBadgeInput
  const badge = await badgesService.createBadge(input)
  sendCreated(res, badge.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateBadgeInput
  const badge = await badgesService.updateBadge(req.params.id, input)
  sendSuccess(res, badge.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await badgesService.deleteBadge(req.params.id)
  sendNoContent(res)
})

export const getEarnedStudents = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const result = await badgesService.getEarnedStudents(req.params.id, page, limit)
  sendPaginated(res, result.students, result.meta)
})

export const awardBadge = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.body
  await badgesService.awardBadgeToStudent(req.params.id, studentId)
  sendSuccess(res, { message: 'Badge awarded successfully' })
})
