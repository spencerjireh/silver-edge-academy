import type {
  AdminAuthUser,
  LoginCredentials,
  AdminLoginResponse,
} from '@/types/admin'
import { api, ApiError } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type {
  AdminAuthUser as AuthUser,
  LoginCredentials,
  AdminLoginResponse as LoginResponse,
}

// Re-export ApiError for use in error handling
export { ApiError }

interface LoginApiResponse {
  accessToken: string
  refreshToken: string
  id: string
  email: string
  displayName: string
  role: 'admin' | 'teacher'
  avatarId: string | null
  status: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export async function login(credentials: LoginCredentials): Promise<AdminLoginResponse> {
  const data = await api.post<LoginApiResponse>(
    API_ENDPOINTS.auth.login,
    credentials,
    { skipAuth: true }
  )

  const { accessToken, refreshToken, ...userData } = data

  return {
    user: {
      ...userData,
      assignedClassIds: [],
    } as AdminAuthUser,
    accessToken,
    refreshToken,
  }
}

export async function logout(): Promise<void> {
  return api.post(API_ENDPOINTS.auth.logout)
}

export async function getCurrentUser(): Promise<AdminAuthUser> {
  return api.get<AdminAuthUser>(API_ENDPOINTS.auth.me)
}
