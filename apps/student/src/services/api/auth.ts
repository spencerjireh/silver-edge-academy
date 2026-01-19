import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { StudentLoginCredentials, StudentLoginResponse, StudentAuthUser } from '@/types/student'

/**
 * Backend login response format
 */
interface BackendLoginResponse {
  id: string
  displayName: string
  username: string
  email: string
  role: 'student'
  avatarId: string | null
  status: string
  currentLevel: number
  totalXp: number
  currencyBalance: number
  currentStreakDays: number
  classId?: string
  className?: string
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    editorTheme?: string
    fontSize?: number
  }
  accessToken: string
  refreshToken: string
}

/**
 * Login with username and password
 */
export async function login(credentials: StudentLoginCredentials): Promise<StudentLoginResponse> {
  const response = await api.post<BackendLoginResponse>(
    STUDENT_ENDPOINTS.auth.login,
    credentials,
    { skipAuth: true }
  )

  // Transform backend response to frontend expected format
  const { accessToken, refreshToken, ...userData } = response

  const user: StudentAuthUser = {
    id: userData.id,
    displayName: userData.displayName,
    username: userData.username,
    email: userData.email,
    role: 'student',
    avatarId: userData.avatarId,
    status: userData.status as 'active' | 'inactive',
    currentLevel: userData.currentLevel,
    totalXp: userData.totalXp,
    currencyBalance: userData.currencyBalance,
    currentStreakDays: userData.currentStreakDays,
    classId: userData.classId,
    className: userData.className,
    preferences: userData.preferences,
  }

  return {
    user,
    token: accessToken,
    refreshToken,
  }
}

/**
 * Logout the current user
 */
export async function logout(refreshToken?: string): Promise<void> {
  await api.post(STUDENT_ENDPOINTS.auth.logout, { refreshToken })
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<StudentAuthUser> {
  const response = await api.get<Omit<BackendLoginResponse, 'accessToken' | 'refreshToken'>>(
    STUDENT_ENDPOINTS.auth.me
  )

  return {
    id: response.id,
    displayName: response.displayName,
    username: response.username,
    email: response.email,
    role: 'student',
    avatarId: response.avatarId,
    status: response.status as 'active' | 'inactive',
    currentLevel: response.currentLevel,
    totalXp: response.totalXp,
    currencyBalance: response.currencyBalance,
    currentStreakDays: response.currentStreakDays,
    classId: response.classId,
    className: response.className,
    preferences: response.preferences,
  }
}
