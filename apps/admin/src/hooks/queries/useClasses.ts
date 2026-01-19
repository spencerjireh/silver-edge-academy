import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  archiveClass,
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass,
  type ClassListParams,
  type CreateClassPayload,
  type UpdateClassPayload,
} from '@/services/api/classes'

export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params: ClassListParams) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  students: (id: string) => [...classKeys.detail(id), 'students'] as const,
}

export function useClasses(params: ClassListParams) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => getClasses(params),
  })
}

export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => getClass(id),
    enabled: !!id,
  })
}

export function useClassStudents(
  id: string,
  params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
) {
  return useQuery({
    queryKey: [...classKeys.students(id), params],
    queryFn: () => getClassStudents(id, params),
    enabled: !!id,
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateClassPayload) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateClassPayload) => updateClass(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
    },
  })
}

export function useArchiveClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveClass(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classKeys.detail(id) })
    },
  })
}

export function useAddStudentToClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      addStudentToClass(classId, studentId),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) })
      queryClient.invalidateQueries({ queryKey: classKeys.students(classId) })
    },
  })
}

export function useRemoveStudentFromClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      removeStudentFromClass(classId, studentId),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) })
      queryClient.invalidateQueries({ queryKey: classKeys.students(classId) })
    },
  })
}
