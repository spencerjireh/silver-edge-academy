import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as quizzesService from './quizzes.service'
import type { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './quizzes.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const quizzes = await quizzesService.listQuizzes(req.params.lessonId)
  sendSuccess(res, quizzes.map((q) => q.toJSON()))
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizzesService.getQuizById(req.params.lessonId, req.params.quizId)
  sendSuccess(res, quiz.toJSON())
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateQuizInput
  const quiz = await quizzesService.createQuiz(req.params.lessonId, input)
  sendCreated(res, quiz.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateQuizInput
  const quiz = await quizzesService.updateQuiz(req.params.lessonId, req.params.quizId, input)
  sendSuccess(res, quiz.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await quizzesService.deleteQuiz(req.params.lessonId, req.params.quizId)
  sendNoContent(res)
})

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as SubmitQuizInput
  const result = await quizzesService.submitQuiz(req.params.id, authReq.user.userId, input)
  sendSuccess(res, result)
})

export const getResults = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const studentId = authReq.user.role === 'student' ? authReq.user.userId : undefined
  const results = await quizzesService.getQuizResults(req.params.id, studentId)
  sendSuccess(res, results.map((r) => r.toJSON()))
})
