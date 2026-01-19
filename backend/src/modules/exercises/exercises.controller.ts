import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as exercisesService from './exercises.service'
import type { CreateExerciseInput, UpdateExerciseInput, SubmitExerciseInput } from './exercises.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const exercises = await exercisesService.listExercises(req.params.lessonId)
  sendSuccess(res, exercises.map((e) => e.toJSON()))
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const exercise = await exercisesService.getExerciseById(
    req.params.lessonId,
    req.params.exerciseId
  )
  sendSuccess(res, exercise.toJSON())
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateExerciseInput
  const exercise = await exercisesService.createExercise(req.params.lessonId, input)
  sendCreated(res, exercise.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateExerciseInput
  const exercise = await exercisesService.updateExercise(
    req.params.lessonId,
    req.params.exerciseId,
    input
  )
  sendSuccess(res, exercise.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await exercisesService.deleteExercise(req.params.lessonId, req.params.exerciseId)
  sendNoContent(res)
})

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as SubmitExerciseInput
  const result = await exercisesService.submitExercise(req.params.id, authReq.user.userId, input)
  sendSuccess(res, result)
})

export const getSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const studentId = authReq.user.role === 'student' ? authReq.user.userId : undefined
  const submissions = await exercisesService.getExerciseSubmissions(req.params.id, studentId)
  sendSuccess(res, submissions.map((s) => s.toJSON()))
})
