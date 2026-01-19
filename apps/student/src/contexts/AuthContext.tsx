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
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearAuthStorage,
} from '@silveredge/shared'
import type { StudentAuthUser, AuthContextValue } from '@/types/student'
import * as authApi from '@/services/api/auth'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentAuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    return getStoredAccessToken()
  })
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Login function - caller handles navigation
  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const response = await authApi.login({ username, password })

    // Store tokens
    setStoredAccessToken(response.token)
    setToken(response.token)

    // Store refresh token if provided
    if (response.refreshToken) {
      setStoredRefreshToken(response.refreshToken)
    }

    setUser(response.user)
  }, [])

  // Logout function - caller handles navigation
  const logout = useCallback(async () => {
    try {
      const refreshToken = getStoredRefreshToken()
      await authApi.logout(refreshToken || undefined)
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
      login,
      logout,
    }),
    [user, token, isAuthenticated, isLoading, login, logout]
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
