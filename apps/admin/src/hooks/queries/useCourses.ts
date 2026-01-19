import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getLesson,
  updateLesson,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createLesson,
  deleteLesson as deleteLessonApi,
  duplicateLesson,
  reorderLessons,
  type CourseListParams,
  type CreateCoursePayload,
  type UpdateCoursePayload,
  type UpdateLessonPayload,
  type CreateSectionPayload,
  type UpdateSectionPayload,
  type ReorderSectionsPayload,
  type CreateLessonPayload,
  type DeleteLessonPayload,
  type DuplicateLessonPayload,
  type ReorderLessonsPayload,
} from '@/services/api/courses'

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: CourseListParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
}

export function useCourses(params: CourseListParams) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => getCourses(params),
  })
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => getCourse(id),
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCoursePayload) => updateCourse(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

export function usePublishCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => publishCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) })
    },
  })
}

// Lesson hooks
export const lessonKeys = {
  all: ['lessons'] as const,
  detail: (courseId: string, sectionId: string, lessonId: string) =>
    [...lessonKeys.all, 'detail', courseId, sectionId, lessonId] as const,
}

export function useLesson(courseId: string, sectionId: string, lessonId: string) {
  return useQuery({
    queryKey: lessonKeys.detail(courseId, sectionId, lessonId),
    queryFn: () => getLesson(courseId, sectionId, lessonId),
    enabled: !!courseId && !!sectionId && !!lessonId,
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateLessonPayload) => updateLesson(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lessonKeys.detail(variables.courseId, variables.sectionId, variables.lessonId),
      })
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

// Section hooks
export function useCreateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => createSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

export function useUpdateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSectionPayload) => updateSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, sectionId }: { courseId: string; sectionId: string }) =>
      deleteSection(courseId, sectionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

export function useReorderSections() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReorderSectionsPayload) => reorderSections(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

// Lesson CRUD hooks
export function useCreateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateLessonPayload) => createLesson(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DeleteLessonPayload) => deleteLessonApi(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

export function useDuplicateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DuplicateLessonPayload) => duplicateLesson(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}

export function useReorderLessons() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReorderLessonsPayload) => reorderLessons(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) })
    },
  })
}
