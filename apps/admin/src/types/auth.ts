// Re-export auth types from admin extensions for backward compatibility
export type {
  AdminAuthUser as AuthUser,
  LoginCredentials,
  AdminLoginResponse as LoginResponse,
  AuthState,
  AuthContextValue,
} from './admin'
