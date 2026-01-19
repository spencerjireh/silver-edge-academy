import { Types } from 'mongoose'
import type { PaginationMeta } from '@silveredge/shared'
import { Badge, StudentBadge, type IBadge } from './badges.model'
import { User } from '../users/users.model'
import { ApiError } from '../../utils/ApiError'
import { parsePaginationParams, buildPaginationMeta, buildSortObject } from '../../utils/pagination'
import type { CreateBadgeInput, UpdateBadgeInput, ListBadgesQuery } from './badges.schema'

export interface BadgeListResult {
  badges: IBadge[]
  meta: PaginationMeta
}

export async function listBadges(query: ListBadgesQuery): Promise<BadgeListResult> {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive
  }
  if (query.triggerType) {
    filter.triggerType = query.triggerType
  }

  const [badges, total] = await Promise.all([
    Badge.find(filter).sort(buildSortObject(sortBy, sortOrder)).skip(skip).limit(limit),
    Badge.countDocuments(filter),
  ])

  return {
    badges,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getBadgeById(id: string): Promise<IBadge> {
  const badge = await Badge.findById(id)
  if (!badge) {
    throw ApiError.notFound('Badge')
  }
  return badge
}

export async function createBadge(input: CreateBadgeInput): Promise<IBadge> {
  const badge = await Badge.create({
    ...input,
    gradientFrom: input.gradientFrom || '#6366f1',
    gradientTo: input.gradientTo || '#8b5cf6',
    isActive: input.isActive ?? true,
  })
  return badge
}

export async function updateBadge(id: string, input: UpdateBadgeInput): Promise<IBadge> {
  const badge = await Badge.findById(id)
  if (!badge) {
    throw ApiError.notFound('Badge')
  }

  Object.assign(badge, input)
  await badge.save()
  return badge
}

export async function deleteBadge(id: string): Promise<void> {
  const badge = await Badge.findById(id)
  if (!badge) {
    throw ApiError.notFound('Badge')
  }

  // Check if any students have earned this badge
  const earnedCount = await StudentBadge.countDocuments({ badgeId: badge._id })
  if (earnedCount > 0) {
    throw ApiError.conflict('Cannot delete badge that has been earned by students')
  }

  await badge.deleteOne()
}

export interface EarnedStudent {
  id: string
  displayName: string
  username?: string
  earnedAt: string
}

export interface EarnedStudentsResult {
  students: EarnedStudent[]
  meta: PaginationMeta
}

export async function getEarnedStudents(
  badgeId: string,
  page = 1,
  limit = 10
): Promise<EarnedStudentsResult> {
  const badge = await Badge.findById(badgeId)
  if (!badge) {
    throw ApiError.notFound('Badge')
  }

  const skip = (page - 1) * limit

  const [studentBadges, total] = await Promise.all([
    StudentBadge.find({ badgeId: new Types.ObjectId(badgeId) })
      .sort({ earnedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    StudentBadge.countDocuments({ badgeId: new Types.ObjectId(badgeId) }),
  ])

  const studentIds = studentBadges.map((sb) => sb.studentId)
  const users = await User.find({ _id: { $in: studentIds } }).lean()
  const userMap = new Map(users.map((u) => [u._id.toString(), u]))

  const students: EarnedStudent[] = studentBadges.map((sb) => {
    const user = userMap.get(sb.studentId.toString())
    return {
      id: sb.studentId.toString(),
      displayName: user?.displayName || 'Unknown',
      username: (user as { username?: string })?.username,
      earnedAt: sb.earnedAt.toISOString(),
    }
  })

  return {
    students,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function awardBadgeToStudent(badgeId: string, studentId: string): Promise<void> {
  const badge = await Badge.findById(badgeId)
  if (!badge) {
    throw ApiError.notFound('Badge')
  }

  const student = await User.findById(studentId)
  if (!student || student.role !== 'student') {
    throw ApiError.badRequest('Invalid student')
  }

  // Check if already earned
  const existing = await StudentBadge.findOne({
    badgeId: new Types.ObjectId(badgeId),
    studentId: new Types.ObjectId(studentId),
  })

  if (existing) {
    throw ApiError.conflict('Student has already earned this badge')
  }

  await StudentBadge.create({
    badgeId: new Types.ObjectId(badgeId),
    studentId: new Types.ObjectId(studentId),
  })

  // Increment earned count
  await Badge.findByIdAndUpdate(badgeId, { $inc: { earnedCount: 1 } })
}
