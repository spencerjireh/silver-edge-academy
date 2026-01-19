# Silver Edge Academy - Shared Package Specification

> This document specifies the `packages/shared` package containing TypeScript types, API client, constants, and utilities shared between Admin Portal, Student Portal, and Backend.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Package Structure](#2-package-structure)
3. [TypeScript Types](#3-typescript-types)
4. [Constants](#4-constants)
5. [API Client](#5-api-client)
6. [Authentication Utilities](#6-authentication-utilities)
7. [Utility Functions](#7-utility-functions)
8. [Export Structure](#8-export-structure)

---

## 1. Overview

### 1.1 Purpose

The shared package provides common code shared between all applications in the Silver Edge Academy monorepo:
- Type definitions for API contracts
- Constants for validation and business rules
- API client for HTTP communication
- Authentication utilities
- Common helper functions

### 1.2 Design Principles

1. **No UI Components**: This package contains ONLY types, utilities, and logic. All UI components live in their respective apps.
2. **Tree-shakeable**: All exports are designed for optimal tree-shaking. Import only what you need.
3. **Type-safe**: Full TypeScript coverage with strict mode.
4. **Framework-agnostic**: No React or frontend framework dependencies in core utilities.
5. **Isomorphic**: Code works in both browser and Node.js environments where possible.

### 1.3 Package Information

```json
{
  "name": "@silveredge/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./types": {
      "import": "./dist/types.mjs",
      "require": "./dist/types.js",
      "types": "./dist/types.d.ts"
    },
    "./constants": {
      "import": "./dist/constants.mjs",
      "require": "./dist/constants.js",
      "types": "./dist/constants.d.ts"
    },
    "./api": {
      "import": "./dist/api.mjs",
      "require": "./dist/api.js",
      "types": "./dist/api.d.ts"
    },
    "./auth": {
      "import": "./dist/auth.mjs",
      "require": "./dist/auth.js",
      "types": "./dist/auth.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.js",
      "types": "./dist/utils.d.ts"
    }
  }
}
```

---

## 2. Package Structure

### 2.1 Directory Layout

```
packages/shared/
├── src/
│   ├── index.ts          # Main entry, re-exports all
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # Application constants
│   ├── api.ts            # API client class
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

### 2.2 Build Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 3. TypeScript Types

### 3.1 User Types

```typescript
// src/types.ts

/**
 * User roles in the system.
 * - admin: Full system access
 * - teacher: Course creation, student management
 * - parent: Linked to student account (no portal access)
 * - student: Learning, exercises, gamification
 */
export type UserRole = 'admin' | 'teacher' | 'parent' | 'student'

/**
 * User status values
 */
export type UserStatus = 'active' | 'inactive'

/**
 * Base user interface shared by all roles
 */
export interface User {
  id: string
  email: string | null
  displayName: string
  role: UserRole
  status: UserStatus
  avatarId: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Admin user - has full system access
 */
export interface Admin extends User {
  role: 'admin'
}

/**
 * Teacher user - manages classes and content
 */
export interface Teacher extends User {
  role: 'teacher'
  classIds: string[]
  classCount: number
  studentCount: number
}

/**
 * Parent user - linked to student account(s) (no portal access)
 * A parent can have multiple children who are students
 */
export interface Parent extends User {
  role: 'parent'
  childIds: string[]
  childNames: string[]
}

/**
 * Student user - learner with gamification stats
 * Each student must have at least one parent linked
 */
export interface Student extends User {
  role: 'student'
  username: string
  parentIds: string[]  // Required: at least one parent
  classId: string | null
  className: string | null
  currentLevel: number
  totalXp: number
  currencyBalance: number
  currentStreakDays: number
  lastActivityDate: string | null
  preferences: StudentPreferences
}

/**
 * Student preferences stored in database
 */
export interface StudentPreferences {
  uiThemeId: string | null
  editorThemeId: string | null
  soundEffectsEnabled: boolean
}

/**
 * Form data for creating/updating users
 */
export interface UserCreateInput {
  email?: string | null
  displayName: string
  password: string
  status?: UserStatus
}

export interface StudentCreateInput extends UserCreateInput {
  username: string
  classId?: string | null
  parentIds: string[]  // Required: at least one parent
}

export interface TeacherCreateInput extends UserCreateInput {
  email: string // Required for teachers
  classIds?: string[]
}

export interface ParentCreateInput extends UserCreateInput {
  email: string // Required for parents
  childIds?: string[]  // Can link to existing students
}

export interface UserUpdateInput {
  email?: string | null
  displayName?: string
  password?: string
  status?: UserStatus
  avatarId?: string | null
}

export interface StudentUpdateInput extends UserUpdateInput {
  classId?: string | null
  parentIds?: string[]  // Must have at least one if provided
  preferences?: Partial<StudentPreferences>
}

export interface ParentUpdateInput extends UserUpdateInput {
  childIds?: string[]  // Can link to multiple students
}
```

### 3.2 Course Types

```typescript
/**
 * Supported programming languages
 */
export type ProgrammingLanguage = 'javascript' | 'python'

/**
 * Content status
 */
export type ContentStatus = 'draft' | 'published'

/**
 * Code editor modes
 */
export type CodeMode = 'visual' | 'text' | 'mixed'

/**
 * Editor complexity levels
 */
export type EditorComplexity = 'simplified' | 'standard' | 'advanced'

/**
 * Course entity
 */
export interface Course {
  id: string
  title: string
  description: string | null
  language: ProgrammingLanguage
  status: ContentStatus
  createdBy: string
  sectionCount: number
  lessonCount: number
  classCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Course with sections expanded
 */
export interface CourseWithSections extends Course {
  sections: Section[]
}

/**
 * Section within a course
 */
export interface Section {
  id: string
  courseId: string
  title: string
  description: string | null
  orderIndex: number
  lessonCount: number
}

/**
 * Section with lessons expanded
 */
export interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

/**
 * Lesson entity
 */
export interface Lesson {
  id: string
  sectionId: string
  title: string
  content: string
  codeMode: CodeMode
  editorComplexity: EditorComplexity
  starterCode: string | null
  status: ContentStatus
  orderIndex: number
  duration: number | null
  xpReward: number
  lockedBy: string | null
  lockedAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Lesson with exercises and quiz
 */
export interface LessonWithContent extends Lesson {
  exercises: Exercise[]
  quiz: QuizQuestion[] | null
}

/**
 * Exercise within a lesson
 */
export interface Exercise {
  id: string
  lessonId: string
  title: string
  instructions: string
  starterCode: string | null
  solution: string
  testCases: TestCase[]
  xpValue: number
  orderIndex: number
}

/**
 * Test case for exercise validation
 */
export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

/**
 * Quiz question types
 */
export type QuizQuestionType =
  | 'multiple-choice'
  | 'multiple-answer'
  | 'true-false'
  | 'code-output'
  | 'fill-blank'
  | 'parsons'

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: string
  lessonId: string
  type: QuizQuestionType
  question: string
  options: string[] | null
  correctAnswer: string | number | number[]
  codeSnippet: string | null
  explanation: string | null
  points: number
  orderIndex: number
}
```

### 3.3 Class Types

```typescript
/**
 * Class entity
 */
export interface Class {
  id: string
  name: string
  description: string | null
  color: string | null
  teacherId: string
  teacherName: string
  studentCount: number
  courseCount: number
  startDate: string | null
  endDate: string | null
  status: 'active' | 'archived' | 'draft'
  createdAt: string
}

/**
 * Class with related entities
 */
export interface ClassWithDetails extends Class {
  students: Student[]
  courses: Course[]
}

/**
 * Lesson unlock status for a class
 */
export interface LessonUnlock {
  lessonId: string
  classId: string
  unlockedAt: string
  unlockedBy: string
}
```

### 3.4 Progress Types

```typescript
/**
 * Progress status
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

/**
 * Lesson progress
 */
export interface LessonProgress {
  id: string
  studentId: string
  lessonId: string
  status: ProgressStatus
  completionPercentage: number
  startedAt: string | null
  completedAt: string | null
}

/**
 * Course progress summary
 */
export interface CourseProgress {
  courseId: string
  courseTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  currentLessonId: string | null
  currentSectionId: string | null
}

/**
 * Exercise submission
 */
export interface ExerciseSubmission {
  id: string
  studentId: string
  exerciseId: string
  code: string
  testsPassed: number
  testsTotal: number
  passed: boolean
  submittedAt: string
}

/**
 * Quiz submission
 */
export interface QuizSubmission {
  id: string
  studentId: string
  quizId: string
  answers: QuizAnswer[]
  score: number
  totalPoints: number
  attemptNumber: number
  isFirstAttempt: boolean
  submittedAt: string
}

export interface QuizAnswer {
  questionId: string
  answer: string | number | number[]
  isCorrect: boolean
  pointsEarned: number
}
```

### 3.5 Attendance Types

```typescript
/**
 * Attendance status values
 */
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

/**
 * Attendance record for a student in a class session
 */
export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  classId: string
  date: string // ISO date string (YYYY-MM-DD)
  status: AttendanceStatus
  notes: string | null
  markedBy: string
  markedAt: string
}

/**
 * Attendance summary for a student
 */
export interface AttendanceSummary {
  studentId: string
  classId: string
  totalSessions: number
  presentCount: number
  lateCount: number
  absentCount: number
  excusedCount: number
  attendanceRate: number // percentage
}
```

### 3.6 Video Tracking Types

```typescript
/**
 * Video view tracking (tracks when student starts a video)
 */
export interface VideoView {
  id: string
  studentId: string
  lessonId: string
  videoUrl: string
  startedAt: string
}
```

### 3.7 Gamification Types

```typescript
/**
 * Badge trigger types
 */
export type BadgeTriggerType =
  | 'first_login'
  | 'first_lesson'
  | 'first_exercise'
  | 'first_quiz'
  | 'first_sandbox'
  | 'lessons_completed'
  | 'exercises_passed'
  | 'courses_finished'
  | 'login_streak'
  | 'xp_earned'
  | 'level_reached'

/**
 * Badge entity
 */
export interface Badge {
  id: string
  name: string
  description: string
  iconName: string
  gradientFrom: string
  gradientTo: string
  triggerType: BadgeTriggerType
  triggerValue: number
  earnedCount: number
  isActive: boolean
  createdAt: string
}

/**
 * Student earned badge
 */
export interface StudentBadge {
  badge: Badge
  earnedAt: string
}

/**
 * Shop item categories
 */
export type ShopItemCategory =
  | 'avatar'
  | 'ui_theme'
  | 'editor_theme'
  | 'teacher_reward'

/**
 * Shop item entity
 */
export interface ShopItem {
  id: string
  name: string
  description: string | null
  category: ShopItemCategory
  price: number
  assetUrl: string | null
  previewData: Record<string, unknown> | null
  isPermanent: boolean
  isActive: boolean
  createdBy: string
  classId: string | null
  purchaseCount: number
  createdAt: string
}

/**
 * Student purchase record
 */
export interface Purchase {
  id: string
  studentId: string
  itemId: string
  item: ShopItem
  purchasedAt: string
  fulfilledAt: string | null
  fulfilledBy: string | null
  status: 'pending' | 'fulfilled' | 'cancelled'
}

/**
 * XP transaction record
 */
export interface XpTransaction {
  id: string
  studentId: string
  amount: number
  sourceType: 'lesson' | 'exercise' | 'quiz' | 'daily_login' | 'first_of_day' | 'badge' | 'manual'
  sourceId: string | null
  isFirstAttempt: boolean
  createdAt: string
}

/**
 * Level information
 */
export interface LevelInfo {
  level: number
  xpRequired: number
  xpForNext: number
  progressToNext: number
}
```

### 3.8 API Types

```typescript
/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Single item API response
 */
export interface ApiResponse<T> {
  data: T
}

/**
 * API error response
 */
export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * Login request
 */
export interface LoginRequest {
  identifier: string  // email or username
  password: string
  rememberMe?: boolean
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  expiresAt: string
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
  accessToken: string
  expiresAt: string
}

/**
 * Exercise submission request
 */
export interface ExerciseSubmitRequest {
  code: string
}

/**
 * Exercise submission response
 */
export interface ExerciseSubmitResponse {
  passed: boolean
  testsPassed: number
  testsTotal: number
  xpEarned: number
}

/**
 * Quiz submission request
 */
export interface QuizSubmitRequest {
  answers: { questionId: string; answer: string | number | number[] }[]
}

/**
 * Quiz submission response
 */
export interface QuizSubmitResponse {
  score: number
  totalPoints: number
  percentage: number
  xpEarned: number
  attemptNumber: number
  results: {
    questionId: string
    isCorrect: boolean
    correctAnswer: string | number | number[]
    explanation: string | null
  }[]
}

/**
 * Help request entity
 */
export interface HelpRequest {
  id: string
  studentId: string
  studentName: string
  exerciseId: string
  exerciseTitle: string
  lessonTitle: string
  message: string
  codeSnapshot: string
  status: 'pending' | 'responded'
  responseMarkdown: string | null
  respondedBy: string | null
  respondedByName: string | null
  createdAt: string
  respondedAt: string | null
}

/**
 * Help request create input
 */
export interface HelpRequestCreateInput {
  exerciseId: string
  message: string
  codeSnapshot: string
}

/**
 * Help request response input
 */
export interface HelpRequestResponseInput {
  responseMarkdown: string
}
```

---

## 4. Constants

### 4.1 App Constants

```typescript
// src/constants.ts

/**
 * Application name
 */
export const APP_NAME = 'Silver Edge Academy'

/**
 * Virtual currency name
 */
export const CURRENCY_NAME = 'Coins'

/**
 * Default avatar ID for new students
 */
export const DEFAULT_AVATAR_ID = 'default-avatar'
```

### 4.2 Validation Constants

```typescript
/**
 * Username validation rules
 */
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

/**
 * Password validation rules
 */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100

/**
 * Display name validation rules
 */
export const DISPLAY_NAME_MIN_LENGTH = 2
export const DISPLAY_NAME_MAX_LENGTH = 50

/**
 * Content limits
 */
export const COURSE_TITLE_MAX_LENGTH = 100
export const COURSE_DESCRIPTION_MAX_LENGTH = 500
export const SECTION_TITLE_MAX_LENGTH = 100
export const LESSON_TITLE_MAX_LENGTH = 100
export const LESSON_CONTENT_MAX_LENGTH = 50000
export const EXERCISE_TITLE_MAX_LENGTH = 100
export const EXERCISE_INSTRUCTIONS_MAX_LENGTH = 5000
export const CODE_MAX_LENGTH = 10000
export const HELP_MESSAGE_MAX_LENGTH = 1000

/**
 * Item limits
 */
export const MAX_SECTIONS_PER_COURSE = 50
export const MAX_LESSONS_PER_SECTION = 50
export const MAX_EXERCISES_PER_LESSON = 20
export const MAX_QUIZ_QUESTIONS_PER_LESSON = 20
export const MAX_TEST_CASES_PER_EXERCISE = 20
export const MAX_SANDBOX_PROJECTS = 50
```

### 4.3 Gamification Constants

```typescript
/**
 * Default XP values for actions
 */
export const DEFAULT_XP_VALUES = {
  lessonComplete: 10,
  exerciseComplete: 15,
  perfectQuiz: 25,
  quizComplete: 10,
  dailyLogin: 5,
  firstOfDay: 10,
} as const

export type XpAction = keyof typeof DEFAULT_XP_VALUES

/**
 * Level formula constants
 * XP required = BASE_XP * (MULTIPLIER ^ level)
 */
export const LEVEL_BASE_XP = 100
export const LEVEL_MULTIPLIER = 1.5

/**
 * Calculate XP required for a level
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 1))
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXp(totalXp: number): LevelInfo {
  let level = 1
  let xpRequired = 0

  while (getXpForLevel(level + 1) <= totalXp) {
    level++
  }

  xpRequired = getXpForLevel(level)
  const xpForNext = getXpForLevel(level + 1)
  const progressToNext = xpForNext > xpRequired
    ? (totalXp - xpRequired) / (xpForNext - xpRequired)
    : 0

  return {
    level,
    xpRequired,
    xpForNext,
    progressToNext,
  }
}

/**
 * Coin to XP conversion rate
 * Students earn 1 coin per X XP
 */
export const COINS_PER_XP = 10
```

### 4.4 Execution Constants

```typescript
/**
 * Code execution timeout in milliseconds
 */
export const CODE_EXECUTION_TIMEOUT_MS = 7000

/**
 * Maximum output length in characters
 */
export const CODE_OUTPUT_MAX_LENGTH = 10000

/**
 * Blocked Python modules for security
 */
export const BLOCKED_PYTHON_MODULES = [
  'os',
  'sys',
  'subprocess',
  'socket',
  'shutil',
  'pathlib',
  'importlib',
  '__import__',
] as const
```

### 4.5 Pagination Constants

```typescript
/**
 * Default page size for lists
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Maximum page size allowed
 */
export const MAX_PAGE_SIZE = 100

/**
 * Available page sizes
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
```

### 4.6 File Upload Constants

```typescript
/**
 * Maximum file size in bytes (50MB)
 */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

/**
 * Maximum file size in MB
 */
export const MAX_FILE_SIZE_MB = 50

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'application/pdf',
] as const

/**
 * Allowed file extensions
 */
export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.pdf',
] as const
```

---

## 5. API Client

### 5.1 ApiClient Class

```typescript
// src/api.ts

import type { ApiError, ApiResponse, PaginatedResponse, PaginationParams } from './types'

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string
  onUnauthorized?: () => void
  onError?: (error: ApiError) => void
}

/**
 * Request options
 */
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private onUnauthorized?: () => void
  private onError?: (error: ApiError) => void
  private refreshPromise: Promise<string | null> | null = null

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl
    this.onUnauthorized = config.onUnauthorized
    this.onError = config.onError
  }

  /**
   * Set access token
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string | null): void {
    this.refreshToken = token
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  /**
   * Build headers for request
   */
  private buildHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    })

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }

    return headers
  }

  /**
   * Handle API error response
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let error: ApiError

    try {
      error = await response.json()
    } catch {
      error = {
        error: {
          code: 'UNKNOWN_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      }
    }

    if (response.status === 401) {
      this.onUnauthorized?.()
    }

    this.onError?.(error)
    throw error
  }

  /**
   * Attempt to refresh access token
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null
    }

    // Deduplicate concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        })

        if (!response.ok) {
          this.accessToken = null
          this.refreshToken = null
          return null
        }

        const data = await response.json()
        this.accessToken = data.accessToken
        return this.accessToken
      } catch {
        this.accessToken = null
        this.refreshToken = null
        return null
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)
    const headers = this.buildHeaders(options.headers)

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle 401 with token refresh
    if (response.status === 401 && this.refreshToken) {
      const newToken = await this.refreshAccessToken()

      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`)
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        })
      }
    }

    if (!response.ok) {
      return this.handleErrorResponse(response)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  /**
   * GET request with pagination
   */
  async getPaginated<T>(
    endpoint: string,
    pagination?: PaginationParams,
    filters?: Record<string, string | number | boolean | undefined>
  ): Promise<PaginatedResponse<T>> {
    const params = {
      ...filters,
      page: pagination?.page,
      limit: pagination?.limit,
      sort: pagination?.sort,
      order: pagination?.order,
    }
    return this.request<PaginatedResponse<T>>(endpoint, { method: 'GET', params })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete<T = void>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const headers = new Headers()
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }
    // Don't set Content-Type - browser will set it with boundary

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      return this.handleErrorResponse(response)
    }

    return response.json()
  }
}

/**
 * Create API client instance
 * Each app should create its own instance with appropriate config
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}
```

### 5.2 Default Instance

```typescript
// Default API URL detection
const getDefaultApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return (import.meta as any).env?.VITE_API_URL || '/api'
  }
  // Node environment
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
}

/**
 * Default API client instance
 * Apps can use this or create their own
 */
export const apiClient = new ApiClient({
  baseUrl: getDefaultApiUrl(),
})
```

---

## 6. Authentication Utilities

### 6.1 Token Storage

```typescript
// src/auth.ts

const ACCESS_TOKEN_KEY = 'silveredge_access_token'
const REFRESH_TOKEN_KEY = 'silveredge_refresh_token'
const USER_KEY = 'silveredge_user'

/**
 * Storage interface for token persistence
 */
export interface TokenStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * Default storage (localStorage with fallback)
 */
const defaultStorage: TokenStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },
}

let storage: TokenStorage = defaultStorage

/**
 * Set custom storage implementation
 */
export function setTokenStorage(customStorage: TokenStorage): void {
  storage = customStorage
}

/**
 * Get stored access token
 */
export function getStoredAccessToken(): string | null {
  return storage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Set access token in storage
 */
export function setStoredAccessToken(token: string | null): void {
  if (token) {
    storage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    storage.removeItem(ACCESS_TOKEN_KEY)
  }
}

/**
 * Get stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  return storage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Set refresh token in storage
 */
export function setStoredRefreshToken(token: string | null): void {
  if (token) {
    storage.setItem(REFRESH_TOKEN_KEY, token)
  } else {
    storage.removeItem(REFRESH_TOKEN_KEY)
  }
}

/**
 * Get stored user data
 */
export function getStoredUser<T extends User>(): T | null {
  const data = storage.getItem(USER_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

/**
 * Set user data in storage
 */
export function setStoredUser(user: User | null): void {
  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    storage.removeItem(USER_KEY)
  }
}

/**
 * Clear all auth data from storage
 */
export function clearAuthStorage(): void {
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
  storage.removeItem(USER_KEY)
}
```

### 6.2 Role Checking

```typescript
import type { User, UserRole } from './types'

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

/**
 * Check if user is a teacher
 */
export function isTeacher(user: User | null): boolean {
  return user?.role === 'teacher'
}

/**
 * Check if user is a student
 */
export function isStudent(user: User | null): boolean {
  return user?.role === 'student'
}

/**
 * Check if user is a parent
 */
export function isParent(user: User | null): boolean {
  return user?.role === 'parent'
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user can manage a class (admin or assigned teacher)
 */
export function canManageClass(user: User | null, teacherId: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'teacher' && user.id === teacherId) return true
  return false
}

/**
 * Check if user can edit content (admin or teacher)
 */
export function canEditContent(user: User | null): boolean {
  return hasRole(user, ['admin', 'teacher'])
}

/**
 * Check if user can manage users (admin only)
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage system settings (admin only)
 */
export function canManageSettings(user: User | null): boolean {
  return isAdmin(user)
}
```

### 6.3 JWT Utilities

```typescript
/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string
  role: UserRole
  email: string | null
  exp: number
  iat: number
}

/**
 * Decode JWT token (without verification)
 * Note: This does NOT verify the token, only decodes it
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload) return true

  // Add 30 second buffer
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now + 30
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJwt(token)
  if (!payload) return null
  return new Date(payload.exp * 1000)
}
```

---

## 7. Utility Functions

### 7.1 Formatters

```typescript
// src/utils.ts

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

/**
 * Format number as compact (1.2K, 1.5M)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value)
}

/**
 * Format date as short date (Jan 15, 2026)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

/**
 * Format date as relative time (2 hours ago, Yesterday)
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`

  return formatDate(d)
}

/**
 * Format XP amount with suffix
 */
export function formatXp(xp: number): string {
  return `${formatNumber(xp)} XP`
}

/**
 * Format currency amount
 */
export function formatCurrency(coins: number): string {
  return `${formatNumber(coins)} Coins`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
```

### 7.2 Validators

```typescript
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  PASSWORD_MIN_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
} from './constants'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }
  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` }
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `Username must be at most ${USERNAME_MAX_LENGTH} characters` }
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  return { valid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  return { valid: true }
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }
  }
  return { valid: true }
}

/**
 * Validate display name
 */
export function validateDisplayName(name: string): ValidationResult {
  if (!name) {
    return { valid: false, error: 'Display name is required' }
  }
  if (name.length < DISPLAY_NAME_MIN_LENGTH) {
    return { valid: false, error: `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters` }
  }
  if (name.length > DISPLAY_NAME_MAX_LENGTH) {
    return { valid: false, error: `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters` }
  }
  return { valid: true }
}

/**
 * Validate password confirmation
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }
  return { valid: true }
}
```

### 7.3 Helper Functions

```typescript
/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Sleep/delay helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Slugify string for URLs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a)
    const bVal = keyFn(b)
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Remove undefined/null values from object
 */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  ) as Partial<T>
}
```

---

## 8. Export Structure

### 8.1 Main Index

```typescript
// src/index.ts

// Types
export * from './types'

// Constants
export * from './constants'

// API
export { ApiClient, createApiClient, apiClient } from './api'
export type { ApiClientConfig, RequestOptions } from './api'

// Auth
export {
  // Token storage
  setTokenStorage,
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
  // Role checking
  isAdmin,
  isTeacher,
  isStudent,
  isParent,
  hasRole,
  canManageClass,
  canEditContent,
  canManageUsers,
  canManageSettings,
  // JWT utilities
  decodeJwt,
  isTokenExpired,
  getTokenExpiration,
} from './auth'
export type { TokenStorage, JwtPayload } from './auth'

// Utils
export {
  // Formatters
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatRelativeTime,
  formatXp,
  formatCurrency,
  formatPercentage,
  formatDuration,
  formatFileSize,
  // Validators
  validateUsername,
  validateEmail,
  validatePassword,
  validateDisplayName,
  validatePasswordMatch,
  // Helpers
  debounce,
  throttle,
  sleep,
  generateId,
  clamp,
  capitalize,
  slugify,
  pluralize,
  groupBy,
  sortBy,
  deepClone,
  isEmpty,
  compact,
} from './utils'
export type { ValidationResult } from './utils'
```

### 8.2 Submodule Exports

Each submodule file should export its contents for direct imports:

```typescript
// Importing from main package
import { User, ApiClient, formatDate, isAdmin } from '@silveredge/shared'

// Importing from submodules (tree-shakeable)
import type { User, Student, Course } from '@silveredge/shared/types'
import { APP_NAME, DEFAULT_XP_VALUES } from '@silveredge/shared/constants'
import { ApiClient, createApiClient } from '@silveredge/shared/api'
import { isAdmin, getStoredAccessToken } from '@silveredge/shared/auth'
import { formatDate, validateEmail, debounce } from '@silveredge/shared/utils'
```

---

## Appendix: Usage Examples

### Example: API Client Usage

```typescript
import { createApiClient, setStoredAccessToken, setStoredRefreshToken } from '@silveredge/shared'
import type { LoginResponse, PaginatedResponse, Course } from '@silveredge/shared'

// Create client
const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  onUnauthorized: () => {
    window.location.href = '/login'
  },
})

// Login
async function login(email: string, password: string) {
  const response = await api.post<LoginResponse>('/auth/login', {
    identifier: email,
    password
  })

  api.setAccessToken(response.accessToken)
  api.setRefreshToken(response.refreshToken)
  setStoredAccessToken(response.accessToken)
  setStoredRefreshToken(response.refreshToken)

  return response.user
}

// Fetch paginated data
async function getCourses(page: number) {
  const response = await api.getPaginated<Course>('/courses', { page, limit: 10 })
  return response
}
```

### Example: Auth Utilities Usage

```typescript
import {
  isAdmin,
  canManageClass,
  getStoredUser,
  isTokenExpired,
  getStoredAccessToken
} from '@silveredge/shared'

// Check role on route guard
const user = getStoredUser()

if (!user) {
  redirect('/login')
} else if (isAdmin(user)) {
  // Admin dashboard
} else if (canManageClass(user, classId)) {
  // Teacher can manage this class
}

// Check token validity
const token = getStoredAccessToken()
if (token && isTokenExpired(token)) {
  // Refresh token
}
```

### Example: Validators Usage

```typescript
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePasswordMatch
} from '@silveredge/shared'

function validateForm(data: FormData) {
  const errors: Record<string, string> = {}

  const usernameResult = validateUsername(data.username)
  if (!usernameResult.valid) {
    errors.username = usernameResult.error!
  }

  const emailResult = validateEmail(data.email)
  if (!emailResult.valid) {
    errors.email = emailResult.error!
  }

  const passwordResult = validatePassword(data.password)
  if (!passwordResult.valid) {
    errors.password = passwordResult.error!
  }

  const matchResult = validatePasswordMatch(data.password, data.confirmPassword)
  if (!matchResult.valid) {
    errors.confirmPassword = matchResult.error!
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

### Example: Formatters Usage

```typescript
import {
  formatNumber,
  formatRelativeTime,
  formatXp,
  formatCurrency,
  formatPercentage
} from '@silveredge/shared'

// Display student stats
function renderStudentStats(student: Student) {
  return {
    level: `Level ${student.currentLevel}`,
    xp: formatXp(student.totalXp),           // "1,234 XP"
    coins: formatCurrency(student.currencyBalance), // "350 Coins"
    lastActive: formatRelativeTime(student.lastActivityDate!), // "2 hours ago"
  }
}

// Display progress
function renderProgress(completed: number, total: number) {
  const percentage = (completed / total) * 100
  return formatPercentage(percentage, 0)  // "75%"
}
```

---

*Last Updated: 2026-01-16*
*Version: 1.3.0*

### Revision History
| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 1.3.0   | 2026-01-16 | Removed MAX_PORTFOLIO_PROJECTS constant, updated BadgeTriggerType to match implementation (removed portfolio, added first_sandbox) |
| 1.2.0   | 2026-01-16 | Changed parent-student to many-to-many: Student.parentIds (required array), Parent.childIds/childNames (arrays) |
| 1.1.0   | 2026-01-16 | Updated project limits (50 sandbox), removed term from Class type, added Attendance types, added VideoView type |
| 1.0.0   | 2026-01-16 | Initial spec                                         |
