import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as coursesService from './courses.service'
import type { CreateCourseInput, UpdateCourseInput, ListCoursesQuery } from './courses.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListCoursesQuery
  const result = await coursesService.listCourses(query)
  sendPaginated(res, result.courses, result.meta)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const course = await coursesService.getCourseById(req.params.id)
  sendSuccess(res, course)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as CreateCourseInput
  const course = await coursesService.createCourse(input, authReq.user.userId)
  sendCreated(res, course.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateCourseInput
  const course = await coursesService.updateCourse(req.params.id, input)
  sendSuccess(res, course.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await coursesService.deleteCourse(req.params.id)
  sendNoContent(res)
})

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const course = await coursesService.publishCourse(req.params.id)
  sendSuccess(res, course.toJSON())
})

export const unpublish = asyncHandler(async (req: Request, res: Response) => {
  const course = await coursesService.unpublishCourse(req.params.id)
  sendSuccess(res, course.toJSON())
})
