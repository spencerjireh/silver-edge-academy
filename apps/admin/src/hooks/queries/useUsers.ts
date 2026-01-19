import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  linkParentToStudent,
  linkStudentToParent,
  unlinkParentFromStudent,
  unlinkStudentFromParent,
  getUserCourses,
  getUserAchievements,
  type BaseUser,
  type Teacher,
  type Parent,
  type Student,
  type UserListParams,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/services/api/users'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

export function useUsers<T extends BaseUser = BaseUser>(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers<T>(params),
  })
}

export function useTeachers(params: Omit<UserListParams, 'type'>) {
  return useUsers<Teacher>({ ...params, type: 'teacher' })
}

export function useParents(params: Omit<UserListParams, 'type'>) {
  return useUsers<Parent>({ ...params, type: 'parent' })
}

export function useStudents(params: Omit<UserListParams, 'type'>) {
  return useUsers<Student>({ ...params, type: 'student' })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      toggleUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

export function useLinkParentToStudent(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (parentId: string) => linkParentToStudent(studentId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(studentId) })
    },
  })
}

export function useLinkStudentToParent(parentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => linkStudentToParent(parentId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(parentId) })
    },
  })
}

export function useUnlinkParentFromStudent(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (parentId: string) => unlinkParentFromStudent(studentId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(studentId) })
    },
  })
}

export function useUnlinkStudentFromParent(parentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => unlinkStudentFromParent(parentId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(parentId) })
    },
  })
}

export function useUserCourses(userId: string) {
  return useQuery({
    queryKey: [...userKeys.detail(userId), 'courses'] as const,
    queryFn: () => getUserCourses(userId),
    enabled: !!userId,
  })
}

export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: [...userKeys.detail(userId), 'achievements'] as const,
    queryFn: () => getUserAchievements(userId),
    enabled: !!userId,
  })
}
