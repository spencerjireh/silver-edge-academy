import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated } from '../../utils/ApiResponse'
import type { AuthenticatedRequest } from '../../middleware/auth'
import * as helpRequestsService from './helpRequests.service'
import type {
  CreateHelpRequestInput,
  RespondHelpRequestInput,
  AssignHelpRequestInput,
  UpdateStatusInput,
  HelpRequestIdParam,
  ListHelpRequestsQuery,
} from './helpRequests.schema'

// ============================================================================
// Student Controllers
// ============================================================================

export const listStudentRequests = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const query = req.query as unknown as ListHelpRequestsQuery
  const result = await helpRequestsService.listStudentHelpRequests(authReq.user.userId, query)
  // Check if student has a pending help request (status: 'pending' or 'assigned')
  const hasPending = result.requests.some((r) => r.status === 'pending' || r.status === 'assigned')
  // Return format expected by frontend: { requests, hasPending }
  res.status(200).json({ requests: result.requests, hasPending })
})

export const getStudentRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as HelpRequestIdParam
  const request = await helpRequestsService.getStudentHelpRequest(authReq.user.userId, params.requestId)
  sendSuccess(res, request)
})

export const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as CreateHelpRequestInput
  const request = await helpRequestsService.createHelpRequest(authReq.user.userId, input)
  sendCreated(res, request)
})

// ============================================================================
// Teacher/Admin Controllers
// ============================================================================

export const listAllRequests = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const query = req.query as unknown as ListHelpRequestsQuery
  const teacherId = authReq.user.role === 'teacher' ? authReq.user.userId : undefined
  const result = await helpRequestsService.listAllHelpRequests(query, teacherId)
  sendPaginated(
    res,
    result.requests.map((r) => r.toJSON()),
    result.meta
  )
})

export const respondToRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as HelpRequestIdParam
  const input = req.body as RespondHelpRequestInput
  const request = await helpRequestsService.respondToHelpRequest(
    params.requestId,
    authReq.user.userId,
    input
  )
  sendSuccess(res, request.toJSON())
})

export const assignRequest = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as unknown as HelpRequestIdParam
  const input = req.body as AssignHelpRequestInput
  const request = await helpRequestsService.assignHelpRequest(params.requestId, input)
  sendSuccess(res, request.toJSON())
})

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as unknown as HelpRequestIdParam
  const input = req.body as UpdateStatusInput
  const request = await helpRequestsService.updateHelpRequestStatus(params.requestId, input)
  sendSuccess(res, request.toJSON())
})
