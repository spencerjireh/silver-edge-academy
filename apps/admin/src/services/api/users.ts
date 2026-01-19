import type { UserStatus } from '@silveredge/shared'
import type {
  AdminStudent,
  AdminTeacher,
  AdminParent,
  StudentCourse,
  StudentAchievements,
} from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type {
  AdminStudent as Student,
  AdminTeacher as Teacher,
  AdminParent as Parent,
}

// Base user type union
export type User = AdminTeacher | AdminParent | AdminStudent

// Base user interface for common fields
export interface BaseUser {
  id: string
  email?: string
  displayName: string
  role: 'teacher' | 'parent' | 'student'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  status: UserStatus
}

export interface UserListParams {
  type: 'teacher' | 'parent' | 'student'
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateUserPayload {
  firstName: string
  lastName: string
  email?: string
  password: string
  role: 'teacher' | 'parent' | 'student'
  status: UserStatus
  username?: string
  classes?: string[]
  classId?: string
  parentIds?: string[]
  parentEmail?: string
  children?: string[]
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: string
}

export async function getUsers<T extends BaseUser>(
  params: UserListParams
): Promise<UserListResponse<T>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    role: params.type,
    search: params.search,
    status: params.status !== 'all' ? params.status : undefined,
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  }

  return api.get<UserListResponse<T>>(API_ENDPOINTS.users.list, {
    params: queryParams,
    unwrapData: false,
  })
}

export async function getUser(id: string): Promise<User> {
  return api.get<User>(API_ENDPOINTS.users.detail(id))
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return api.post<User>(API_ENDPOINTS.users.create, payload)
}

export async function updateUser(payload: UpdateUserPayload): Promise<User> {
  const { id, ...data } = payload
  return api.patch<User>(API_ENDPOINTS.users.update(id), data)
}

export async function deleteUser(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.users.delete(id))
}

export async function toggleUserStatus(
  id: string,
  status: UserStatus
): Promise<User> {
  return api.patch<User>(API_ENDPOINTS.users.status(id), { status })
}

export async function linkParentToStudent(studentId: string, parentId: string): Promise<void> {
  return api.post(API_ENDPOINTS.users.linkParent(studentId, parentId))
}

export async function linkStudentToParent(parentId: string, studentId: string): Promise<void> {
  return api.post(API_ENDPOINTS.users.linkStudent(parentId, studentId))
}

export async function unlinkParentFromStudent(studentId: string, parentId: string): Promise<void> {
  return api.delete(API_ENDPOINTS.users.unlinkParent(studentId, parentId))
}

export async function unlinkStudentFromParent(parentId: string, studentId: string): Promise<void> {
  return api.delete(API_ENDPOINTS.users.unlinkStudent(parentId, studentId))
}

// Re-export types from admin for student detail views
export type { StudentCourse, StudentAchievements }
export type { StudentBadgeDisplay as StudentBadge, XpHistoryItem } from '@/types/admin'

export async function getUserCourses(userId: string): Promise<StudentCourse[]> {
  return api.get<StudentCourse[]>(API_ENDPOINTS.users.courses(userId))
}

export async function getUserAchievements(userId: string): Promise<StudentAchievements> {
  return api.get<StudentAchievements>(API_ENDPOINTS.users.achievements(userId))
}
