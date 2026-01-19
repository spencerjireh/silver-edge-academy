import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as sectionsService from './sections.service'
import type { CreateSectionInput, UpdateSectionInput, ReorderSectionsInput } from './sections.schema'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const sections = await sectionsService.listSections(req.params.courseId)
  sendSuccess(res, sections.map((s) => s.toJSON()))
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const section = await sectionsService.getSectionById(req.params.courseId, req.params.sectionId)
  sendSuccess(res, section.toJSON())
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateSectionInput
  const section = await sectionsService.createSection(req.params.courseId, input)
  sendCreated(res, section.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateSectionInput
  const section = await sectionsService.updateSection(
    req.params.courseId,
    req.params.sectionId,
    input
  )
  sendSuccess(res, section.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await sectionsService.deleteSection(req.params.courseId, req.params.sectionId)
  sendNoContent(res)
})

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ReorderSectionsInput
  await sectionsService.reorderSections(req.params.courseId, input.sectionIds)
  sendSuccess(res, { message: 'Sections reordered' })
})
