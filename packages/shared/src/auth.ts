import type { User, UserRole } from './types'

// ============================================================================
// Token Storage
// ============================================================================

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_KEY = 'auth_user'

// Access Token
export function getStoredAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

// Refresh Token
export function getStoredRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

// User Storage
export function getStoredUser<T extends User = User>(): T | null {
  if (typeof localStorage === 'undefined') return null
  const userJson = localStorage.getItem(USER_KEY)
  if (!userJson) return null
  try {
    return JSON.parse(userJson) as T
  } catch {
    return null
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof localStorage === 'undefined') return
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

// Clear all auth data
export function clearAuthStorage(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ============================================================================
// Role Checking
// ============================================================================

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isTeacher(user: User | null | undefined): boolean {
  return user?.role === 'teacher'
}

export function isStudent(user: User | null | undefined): boolean {
  return user?.role === 'student'
}

export function isParent(user: User | null | undefined): boolean {
  return user?.role === 'parent'
}

export function hasRole(user: User | null | undefined, role: UserRole): boolean {
  return user?.role === role
}

export function hasAnyRole(user: User | null | undefined, roles: UserRole[]): boolean {
  return user != null && roles.includes(user.role)
}

// ============================================================================
// Auth State Helpers
// ============================================================================

export function isAuthenticated(): boolean {
  return getStoredAccessToken() !== null
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
