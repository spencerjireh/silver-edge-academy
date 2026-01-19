// Re-export shared types for convenience
export type {
  User,
  UserRole,
  UserStatus,
  Student,
  Teacher,
  Parent,
  Admin,
  Course,
  Section,
  Lesson,
  Exercise,
  Class,
  PaginationParams,
  PaginationMeta,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '@silveredge/shared'

// Re-export typed request interfaces
export type {
  ValidatedRequest,
  AuthenticatedValidatedRequest,
} from './express'
