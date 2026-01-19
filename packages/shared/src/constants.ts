// ============================================================================
// App Constants
// ============================================================================

export const APP_NAME = 'Silver Edge Academy'
export const CURRENCY_NAME = 'Coins'
export const DEFAULT_AVATAR_ID = 'default-avatar'

// ============================================================================
// Pagination
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

// ============================================================================
// Validation - Usernames and Passwords
// ============================================================================

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100
export const DISPLAY_NAME_MIN_LENGTH = 2
export const DISPLAY_NAME_MAX_LENGTH = 50

// ============================================================================
// Content Limits
// ============================================================================

export const COURSE_TITLE_MAX_LENGTH = 100
export const COURSE_DESCRIPTION_MAX_LENGTH = 500
export const SECTION_TITLE_MAX_LENGTH = 100
export const LESSON_TITLE_MAX_LENGTH = 100
export const LESSON_CONTENT_MAX_LENGTH = 50000
export const EXERCISE_TITLE_MAX_LENGTH = 100
export const EXERCISE_INSTRUCTIONS_MAX_LENGTH = 5000
export const CODE_MAX_LENGTH = 10000
export const HELP_MESSAGE_MAX_LENGTH = 1000

// ============================================================================
// Item Limits
// ============================================================================

export const MAX_SECTIONS_PER_COURSE = 50
export const MAX_LESSONS_PER_SECTION = 50
export const MAX_EXERCISES_PER_LESSON = 20
export const MAX_QUIZ_QUESTIONS_PER_LESSON = 20
export const MAX_TEST_CASES_PER_EXERCISE = 20
export const MAX_SANDBOX_PROJECTS = 50

// ============================================================================
// Code Execution
// ============================================================================

export const CODE_EXECUTION_TIMEOUT_MS = 7000
export const CODE_OUTPUT_MAX_LENGTH = 10000

export const BLOCKED_PYTHON_MODULES = [
  'os',
  'sys',
  'subprocess',
  'shutil',
  'socket',
  'http',
  'urllib',
  'requests',
  'ftplib',
  'smtplib',
  'pickle',
  'shelve',
  'marshal',
  'builtins',
  'importlib',
  '__builtins__',
] as const

// ============================================================================
// Gamification
// ============================================================================

export const DEFAULT_XP_VALUES = {
  lessonComplete: 10,
  exerciseComplete: 15,
  perfectQuiz: 25,
  dailyLogin: 5,
  firstOfDay: 10,
  streakBonus: 5,
} as const

export type XpAction = keyof typeof DEFAULT_XP_VALUES

export const LEVEL_BASE_XP = 100
export const LEVEL_MULTIPLIER = 1.5

/**
 * Calculate XP required to reach a specific level
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 2))
}

/**
 * Calculate cumulative XP required for a level
 */
export function getCumulativeXpForLevel(level: number): number {
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += getXpForLevel(i)
  }
  return total
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 1
  let cumulativeXp = 0
  while (true) {
    const xpForNext = getXpForLevel(level + 1)
    if (cumulativeXp + xpForNext > totalXp) break
    cumulativeXp += xpForNext
    level++
  }
  return level
}

export const COINS_PER_XP = 10

// ============================================================================
// File Upload
// ============================================================================

export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mp3',
  'audio/wav',
  'application/pdf',
] as const

export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.pdf',
] as const

// ============================================================================
// Time Constants
// ============================================================================

export const SESSION_TIMEOUT_MINUTES = 30
export const REFRESH_TOKEN_DAYS = 7
export const LESSON_LOCK_TIMEOUT_MINUTES = 30
