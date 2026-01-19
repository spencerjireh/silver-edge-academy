import { Types } from 'mongoose'
import type { PaginationMeta } from '@silveredge/shared'
import { HelpRequest, type IHelpRequest } from './helpRequest.model'
import { Lesson } from '../lessons/lessons.model'
import { Exercise } from '../exercises/exercises.model'
import { User } from '../users/users.model'
import { StudentProfile } from '../users/studentProfile.model'
import { ApiError } from '../../utils/ApiError'
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination'
import type {
  CreateHelpRequestInput,
  RespondHelpRequestInput,
  AssignHelpRequestInput,
  UpdateStatusInput,
  ListHelpRequestsQuery,
} from './helpRequests.schema'

export interface HelpRequestListResult {
  requests: IHelpRequest[]
  meta: PaginationMeta
}

export interface StudentHelpRequestView {
  id: string
  lessonId: string
  lessonTitle: string
  exerciseId?: string
  exerciseTitle?: string
  message: string
  codeSnapshot?: string
  status: string
  response?: string
  teacherName?: string
  respondedAt?: string
  createdAt: string
}

// ============================================================================
// Student Services
// ============================================================================

export async function listStudentHelpRequests(
  studentId: string,
  query: ListHelpRequestsQuery
): Promise<{ requests: StudentHelpRequestView[]; meta: PaginationMeta }> {
  const { page, limit, skip } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {
    studentId: new Types.ObjectId(studentId),
  }

  if (query.status) {
    filter.status = query.status
  }

  const [requests, total] = await Promise.all([
    HelpRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    HelpRequest.countDocuments(filter),
  ])

  // Enrich with lesson and exercise titles
  const enrichedRequests = await Promise.all(
    requests.map(async (req) => {
      const lesson = await Lesson.findById(req.lessonId)
      let exerciseTitle: string | undefined
      let teacherName: string | undefined

      if (req.exerciseId) {
        const exercise = await Exercise.findById(req.exerciseId)
        exerciseTitle = exercise?.title
      }

      if (req.assignedTeacherId) {
        const teacher = await User.findById(req.assignedTeacherId)
        teacherName = teacher?.displayName
      }

      return {
        id: req._id.toString(),
        lessonId: req.lessonId.toString(),
        lessonTitle: lesson?.title || 'Unknown Lesson',
        exerciseId: req.exerciseId?.toString(),
        exerciseTitle,
        message: req.message,
        codeSnapshot: req.codeSnapshot,
        status: req.status,
        response: req.response,
        teacherName,
        respondedAt: req.respondedAt?.toISOString(),
        createdAt: req.createdAt.toISOString(),
      }
    })
  )

  return {
    requests: enrichedRequests,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getStudentHelpRequest(
  studentId: string,
  requestId: string
): Promise<StudentHelpRequestView> {
  const request = await HelpRequest.findOne({
    _id: new Types.ObjectId(requestId),
    studentId: new Types.ObjectId(studentId),
  })

  if (!request) {
    throw ApiError.notFound('Help request')
  }

  const lesson = await Lesson.findById(request.lessonId)
  let exerciseTitle: string | undefined
  let teacherName: string | undefined

  if (request.exerciseId) {
    const exercise = await Exercise.findById(request.exerciseId)
    exerciseTitle = exercise?.title
  }

  if (request.assignedTeacherId) {
    const teacher = await User.findById(request.assignedTeacherId)
    teacherName = teacher?.displayName
  }

  return {
    id: request._id.toString(),
    lessonId: request.lessonId.toString(),
    lessonTitle: lesson?.title || 'Unknown Lesson',
    exerciseId: request.exerciseId?.toString(),
    exerciseTitle,
    message: request.message,
    codeSnapshot: request.codeSnapshot,
    status: request.status,
    response: request.response,
    teacherName,
    respondedAt: request.respondedAt?.toISOString(),
    createdAt: request.createdAt.toISOString(),
  }
}

export async function createHelpRequest(
  studentId: string,
  input: CreateHelpRequestInput
): Promise<StudentHelpRequestView> {
  // Verify lesson exists
  const lesson = await Lesson.findById(input.lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Verify exercise exists if provided
  let exerciseTitle: string | undefined
  if (input.exerciseId) {
    const exercise = await Exercise.findById(input.exerciseId)
    if (!exercise) {
      throw ApiError.notFound('Exercise')
    }
    exerciseTitle = exercise.title
  }

  // Get student's class
  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(studentId) })

  const request = await HelpRequest.create({
    studentId: new Types.ObjectId(studentId),
    classId: profile?.classId,
    lessonId: new Types.ObjectId(input.lessonId),
    exerciseId: input.exerciseId ? new Types.ObjectId(input.exerciseId) : undefined,
    message: input.message,
    codeSnapshot: input.codeSnapshot,
    status: 'pending',
  })

  return {
    id: request._id.toString(),
    lessonId: request.lessonId.toString(),
    lessonTitle: lesson.title,
    exerciseId: request.exerciseId?.toString(),
    exerciseTitle,
    message: request.message,
    codeSnapshot: request.codeSnapshot,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  }
}

// ============================================================================
// Teacher/Admin Services
// ============================================================================

export async function listAllHelpRequests(
  query: ListHelpRequestsQuery,
  teacherId?: string
): Promise<HelpRequestListResult> {
  const { page, limit, skip } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}

  if (query.status) {
    filter.status = query.status
  }

  if (query.classId) {
    filter.classId = new Types.ObjectId(query.classId)
  }

  // If teacher, only show requests from their classes
  if (teacherId) {
    const { TeacherProfile } = await import('../users/teacherProfile.model')
    const teacherProfile = await TeacherProfile.findOne({ userId: new Types.ObjectId(teacherId) })
    if (teacherProfile?.classIds.length) {
      filter.classId = { $in: teacherProfile.classIds }
    }
  }

  const [requests, total] = await Promise.all([
    HelpRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    HelpRequest.countDocuments(filter),
  ])

  return {
    requests,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function respondToHelpRequest(
  requestId: string,
  teacherId: string,
  input: RespondHelpRequestInput
): Promise<IHelpRequest> {
  const request = await HelpRequest.findById(requestId)
  if (!request) {
    throw ApiError.notFound('Help request')
  }

  request.response = input.response
  request.respondedAt = new Date()
  request.assignedTeacherId = new Types.ObjectId(teacherId)

  if (input.status) {
    request.status = input.status
  } else if (request.status === 'pending') {
    request.status = 'in_progress'
  }

  await request.save()
  return request
}

export async function assignHelpRequest(
  requestId: string,
  input: AssignHelpRequestInput
): Promise<IHelpRequest> {
  const request = await HelpRequest.findById(requestId)
  if (!request) {
    throw ApiError.notFound('Help request')
  }

  // Verify teacher exists
  const teacher = await User.findById(input.teacherId)
  if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
    throw ApiError.badRequest('Invalid teacher')
  }

  request.assignedTeacherId = new Types.ObjectId(input.teacherId)
  if (request.status === 'pending') {
    request.status = 'in_progress'
  }

  await request.save()
  return request
}

export async function updateHelpRequestStatus(
  requestId: string,
  input: UpdateStatusInput
): Promise<IHelpRequest> {
  const request = await HelpRequest.findById(requestId)
  if (!request) {
    throw ApiError.notFound('Help request')
  }

  request.status = input.status
  await request.save()
  return request
}
