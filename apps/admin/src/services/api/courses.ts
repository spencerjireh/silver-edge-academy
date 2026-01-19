import type {
  ContentStatus,
  ProgrammingLanguage,
  CodeMode,
} from '@silveredge/shared'
import type {
  AdminCourse,
  LessonExercise,
  LessonQuizQuestion,
  LessonDetail,
} from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type { AdminCourse as Course }

export interface CourseSection {
  id: string
  title: string
  description?: string
  order: number
  lessonCount: number
  lessons?: CourseLesson[]
}

export interface CourseLesson {
  id: string
  title: string
  type: 'lesson' | 'quiz' | 'challenge'
  order: number
  duration?: number
  status: ContentStatus
}

export type { LessonExercise, LessonQuizQuestion, LessonDetail }

export interface CourseListParams {
  page?: number
  limit?: number
  search?: string
  language?: ProgrammingLanguage
  status?: ContentStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CourseListResponse {
  data: AdminCourse[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateCoursePayload {
  title: string
  description?: string
  language: ProgrammingLanguage
  status: ContentStatus
}

export interface UpdateCoursePayload {
  id: string
  title?: string
  description?: string
  language?: ProgrammingLanguage
  status?: ContentStatus
}

// ============================================================================
// Course API
// ============================================================================

export async function getCourses(params: CourseListParams): Promise<CourseListResponse> {
  return api.get<CourseListResponse>(API_ENDPOINTS.courses.list, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      language: params.language,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    unwrapData: false,
  })
}

export async function getCourse(id: string): Promise<AdminCourse> {
  return api.get<AdminCourse>(API_ENDPOINTS.courses.detail(id))
}

export async function createCourse(payload: CreateCoursePayload): Promise<AdminCourse> {
  return api.post<AdminCourse>(API_ENDPOINTS.courses.create, payload)
}

export async function updateCourse(payload: UpdateCoursePayload): Promise<AdminCourse> {
  const { id, ...data } = payload
  return api.patch<AdminCourse>(API_ENDPOINTS.courses.update(id), data)
}

export async function deleteCourse(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.courses.delete(id))
}

export async function publishCourse(id: string): Promise<AdminCourse> {
  return api.patch<AdminCourse>(API_ENDPOINTS.courses.publish(id))
}

// ============================================================================
// Section API
// ============================================================================

export interface CreateSectionPayload {
  courseId: string
  title: string
  description?: string
}

export interface UpdateSectionPayload {
  courseId: string
  sectionId: string
  title?: string
  description?: string
}

export interface ReorderSectionsPayload {
  courseId: string
  sectionIds: string[]
}

export async function createSection(payload: CreateSectionPayload): Promise<CourseSection> {
  const { courseId, ...data } = payload
  return api.post<CourseSection>(API_ENDPOINTS.courses.sections.create(courseId), data)
}

export async function updateSection(payload: UpdateSectionPayload): Promise<CourseSection> {
  const { courseId, sectionId, ...data } = payload
  return api.patch<CourseSection>(API_ENDPOINTS.courses.sections.update(courseId, sectionId), data)
}

export async function deleteSection(courseId: string, sectionId: string): Promise<void> {
  return api.delete(API_ENDPOINTS.courses.sections.delete(courseId, sectionId))
}

export async function reorderSections(payload: ReorderSectionsPayload): Promise<CourseSection[]> {
  const { courseId, sectionIds } = payload
  return api.patch<CourseSection[]>(
    API_ENDPOINTS.courses.sections.reorder(courseId),
    { order: sectionIds }
  )
}

// ============================================================================
// Lesson API
// ============================================================================

export interface CreateLessonPayload {
  courseId: string
  sectionId: string
  title: string
}

export interface UpdateLessonPayload {
  courseId: string
  sectionId: string
  lessonId: string
  title?: string
  content?: string
  duration?: number
  xpReward?: number
  editorMode?: CodeMode
  status?: ContentStatus
  exercises?: LessonExercise[]
  quiz?: LessonQuizQuestion[]
}

export interface DeleteLessonPayload {
  courseId: string
  sectionId: string
  lessonId: string
}

export interface DuplicateLessonPayload {
  courseId: string
  sectionId: string
  lessonId: string
}

export interface ReorderLessonsPayload {
  courseId: string
  sectionId: string
  lessonIds: string[]
}

export async function getLesson(
  courseId: string,
  sectionId: string,
  lessonId: string
): Promise<LessonDetail> {
  return api.get<LessonDetail>(
    API_ENDPOINTS.courses.lessons.detail(courseId, sectionId, lessonId)
  )
}

export async function createLesson(payload: CreateLessonPayload): Promise<CourseLesson> {
  const { courseId, sectionId, ...data } = payload
  return api.post<CourseLesson>(
    API_ENDPOINTS.courses.lessons.create(courseId, sectionId),
    data
  )
}

export async function updateLesson(payload: UpdateLessonPayload): Promise<LessonDetail> {
  const { courseId, sectionId, lessonId, ...data } = payload
  return api.patch<LessonDetail>(
    API_ENDPOINTS.courses.lessons.update(courseId, sectionId, lessonId),
    data
  )
}

export async function deleteLesson(payload: DeleteLessonPayload): Promise<void> {
  const { courseId, sectionId, lessonId } = payload
  return api.delete(API_ENDPOINTS.courses.lessons.delete(courseId, sectionId, lessonId))
}

export async function duplicateLesson(payload: DuplicateLessonPayload): Promise<CourseLesson> {
  const { courseId, sectionId, lessonId } = payload
  return api.post<CourseLesson>(
    API_ENDPOINTS.courses.lessons.duplicate(courseId, sectionId, lessonId)
  )
}

export async function reorderLessons(payload: ReorderLessonsPayload): Promise<CourseLesson[]> {
  const { courseId, sectionId, lessonIds } = payload
  return api.patch<CourseLesson[]>(
    API_ENDPOINTS.courses.lessons.reorder(courseId, sectionId),
    { order: lessonIds }
  )
}
