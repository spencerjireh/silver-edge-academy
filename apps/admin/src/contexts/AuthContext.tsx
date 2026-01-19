import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  isAdmin as checkIsAdmin,
  isTeacher as checkIsTeacher,
  getStoredAccessToken,
  setStoredAccessToken,
  clearAuthStorage,
} from '@silveredge/shared'
import type { AdminAuthUser, AuthContextValue } from '@/types/admin'
import * as authApi from '@/services/api/auth'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminAuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    return getStoredAccessToken()
  })
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token
  const isAdmin = checkIsAdmin(user)
  const isTeacher = checkIsTeacher(user)

  // Check if user can access a specific class
  const canAccessClass = useCallback(
    (classId: string): boolean => {
      if (!user) return false
      if (checkIsAdmin(user)) return true
      return user.assignedClassIds.includes(classId)
    },
    [user]
  )

  // Login function - caller handles navigation
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await authApi.login({ email, password })
      setStoredAccessToken(response.accessToken)
      setToken(response.accessToken)
      setUser(response.user)
    },
    []
  )

  // Logout function - caller handles navigation
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors - we're clearing local state anyway
    }
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }, [])

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      const storedToken = getStoredAccessToken()
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
      } catch {
        // Token invalid or expired - clear it
        clearAuthStorage()
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      isAdmin,
      isTeacher,
      canAccessClass,
      login,
      logout,
    }),
    [user, token, isAuthenticated, isLoading, isAdmin, isTeacher, canAccessClass, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
