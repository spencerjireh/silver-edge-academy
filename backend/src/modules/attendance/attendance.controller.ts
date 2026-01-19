import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess } from '../../utils/ApiResponse'
import * as attendanceService from './attendance.service'
import type { MarkAttendanceInput, ListAttendanceQuery } from './attendance.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListAttendanceQuery
  const records = await attendanceService.listAttendance(req.params.id, query)
  sendSuccess(res, records.map((r) => r.toJSON()))
})

export const mark = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as MarkAttendanceInput
  const records = await attendanceService.markAttendance(
    req.params.id,
    input,
    authReq.user.userId
  )
  sendSuccess(res, records.map((r) => r.toJSON()))
})

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.query as { studentId?: string }
  const summary = await attendanceService.getAttendanceSummary(req.params.id, studentId)
  sendSuccess(res, summary)
})
