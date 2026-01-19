import { Types } from 'mongoose'
import { User } from '../../src/modules/users/users.model'
import { StudentProfile } from '../../src/modules/users/studentProfile.model'
import { TeacherProfile } from '../../src/modules/users/teacherProfile.model'
import { Course } from '../../src/modules/courses/courses.model'
import { Section } from '../../src/modules/sections/sections.model'
import { Lesson } from '../../src/modules/lessons/lessons.model'
import { Class } from '../../src/modules/classes/classes.model'
import { Exercise } from '../../src/modules/exercises/exercises.model'
import { Quiz } from '../../src/modules/quizzes/quizzes.model'
import { LessonProgress } from '../../src/modules/progress/lessonProgress.model'
import { ExerciseSubmission } from '../../src/modules/progress/exerciseSubmission.model'
import { QuizSubmission } from '../../src/modules/progress/quizSubmission.model'
import { Badge, StudentBadge } from '../../src/modules/badges/badges.model'
import { ShopItem, Purchase } from '../../src/modules/shop/shop.model'
import { SandboxProject } from '../../src/modules/sandbox/sandboxProject.model'
import { HelpRequest } from '../../src/modules/helpRequests/helpRequest.model'
import { Notification } from '../../src/modules/notifications/notification.model'
import { hashPassword } from '../../src/utils/password'
import type { BadgeTriggerType, ShopItemCategory } from '@silveredge/shared'
import type { HelpRequestStatus } from '../../src/modules/helpRequests/helpRequest.model'
import type { NotificationType } from '../../src/modules/notifications/notification.model'

export async function createTestUser(overrides: Partial<{
  email: string
  username: string
  password: string
  displayName: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
  status: 'active' | 'inactive'
}> = {}) {
  const passwordHash = await hashPassword(overrides.password || 'testpassword123')

  return User.create({
    email: overrides.email || `test-${Date.now()}@example.com`,
    username: overrides.username,
    passwordHash,
    displayName: overrides.displayName || 'Test User',
    role: overrides.role || 'student',
    status: overrides.status || 'active',
  })
}

export async function createTestStudent(overrides: {
  username?: string
  displayName?: string
  classId?: Types.ObjectId
} = {}) {
  const user = await createTestUser({
    username: overrides.username || `student${Date.now()}`,
    displayName: overrides.displayName || 'Test Student',
    role: 'student',
  })

  const profile = await StudentProfile.create({
    userId: user._id,
    classId: overrides.classId,
    currentLevel: 1,
    totalXp: 0,
    currencyBalance: 0,
    currentStreakDays: 0,
  })

  return { user, profile }
}

export async function createTestTeacher(overrides: {
  email?: string
  displayName?: string
} = {}) {
  const user = await createTestUser({
    email: overrides.email || `teacher-${Date.now()}@example.com`,
    displayName: overrides.displayName || 'Test Teacher',
    role: 'teacher',
  })

  const profile = await TeacherProfile.create({
    userId: user._id,
    classIds: [],
  })

  return { user, profile }
}

export async function createTestAdmin(overrides: {
  email?: string
  displayName?: string
} = {}) {
  return createTestUser({
    email: overrides.email || `admin-${Date.now()}@example.com`,
    displayName: overrides.displayName || 'Test Admin',
    role: 'admin',
  })
}

export async function createTestCourse(createdBy: Types.ObjectId, overrides: {
  title?: string
  language?: 'javascript' | 'python'
  status?: 'draft' | 'published'
} = {}) {
  return Course.create({
    title: overrides.title || 'Test Course',
    language: overrides.language || 'javascript',
    status: overrides.status || 'draft',
    createdBy,
  })
}

export async function createTestSection(courseId: Types.ObjectId, overrides: {
  title?: string
  orderIndex?: number
} = {}) {
  return Section.create({
    courseId,
    title: overrides.title || 'Test Section',
    orderIndex: overrides.orderIndex ?? 0,
  })
}

export async function createTestLesson(sectionId: Types.ObjectId, overrides: {
  title?: string
  content?: string
  orderIndex?: number
  status?: 'draft' | 'published'
  xpReward?: number
} = {}) {
  return Lesson.create({
    sectionId,
    title: overrides.title || 'Test Lesson',
    content: overrides.content || '# Test Content',
    orderIndex: overrides.orderIndex ?? 0,
    status: overrides.status || 'draft',
    xpReward: overrides.xpReward ?? 10,
  })
}

export async function createTestClass(teacherId: Types.ObjectId | undefined, overrides: {
  name?: string
  courseIds?: Types.ObjectId[]
  studentIds?: Types.ObjectId[]
} = {}) {
  return Class.create({
    name: overrides.name || 'Test Class',
    teacherId,
    courseIds: overrides.courseIds || [],
    studentIds: overrides.studentIds || [],
    status: 'active',
  })
}

export async function createTestExercise(lessonId: Types.ObjectId, overrides: {
  title?: string
  instructions?: string
  orderIndex?: number
  starterCode?: string
  solution?: string
  xpReward?: number
} = {}) {
  return Exercise.create({
    lessonId,
    title: overrides.title || 'Test Exercise',
    instructions: overrides.instructions || 'Complete this exercise.',
    orderIndex: overrides.orderIndex ?? 0,
    starterCode: overrides.starterCode || '// Your code here',
    solution: overrides.solution || 'console.log("solution")',
    testCases: [
      {
        id: 'test-1',
        input: '',
        expectedOutput: 'solution',
        isHidden: false,
      },
    ],
    xpReward: overrides.xpReward ?? 15,
  })
}

export async function createTestQuiz(lessonId: Types.ObjectId, overrides: {
  title?: string
  xpReward?: number
} = {}) {
  return Quiz.create({
    lessonId,
    title: overrides.title || 'Test Quiz',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
        explanation: 'Basic arithmetic',
        orderIndex: 0,
      },
    ],
    xpReward: overrides.xpReward ?? 25,
  })
}

export async function createTestLessonProgress(studentId: Types.ObjectId, lessonId: Types.ObjectId, overrides: {
  status?: 'not_started' | 'in_progress' | 'completed'
  timeSpentSeconds?: number
  xpEarned?: number
} = {}) {
  return LessonProgress.create({
    studentId,
    lessonId,
    status: overrides.status || 'not_started',
    startedAt: overrides.status !== 'not_started' ? new Date() : undefined,
    completedAt: overrides.status === 'completed' ? new Date() : undefined,
    timeSpentSeconds: overrides.timeSpentSeconds ?? 0,
    xpEarned: overrides.xpEarned ?? 0,
  })
}

export async function createTestExerciseSubmission(studentId: Types.ObjectId, exerciseId: Types.ObjectId, overrides: {
  code?: string
  passed?: boolean
  xpEarned?: number
} = {}) {
  return ExerciseSubmission.create({
    studentId,
    exerciseId,
    code: overrides.code || 'console.log("test")',
    passed: overrides.passed ?? true,
    testResults: [
      {
        testCaseId: 'test-1',
        passed: overrides.passed ?? true,
        actualOutput: 'test',
      },
    ],
    xpEarned: overrides.xpEarned ?? 15,
  })
}

export async function createTestQuizSubmission(studentId: Types.ObjectId, lessonId: Types.ObjectId, quizId: Types.ObjectId, overrides: {
  score?: number
  maxScore?: number
  passed?: boolean
  xpEarned?: number
} = {}) {
  return QuizSubmission.create({
    studentId,
    lessonId,
    quizId,
    answers: [
      {
        questionId: 'q1',
        selectedIndex: 1,
        isCorrect: true,
      },
    ],
    score: overrides.score ?? 1,
    maxScore: overrides.maxScore ?? 1,
    passed: overrides.passed ?? true,
    xpEarned: overrides.xpEarned ?? 25,
  })
}

// ============================================================================
// Badge Helpers
// ============================================================================

export async function createTestBadge(overrides: {
  name?: string
  description?: string
  iconName?: string
  triggerType?: BadgeTriggerType
  triggerValue?: number
  isActive?: boolean
} = {}) {
  return Badge.create({
    name: overrides.name || `Test Badge ${Date.now()}`,
    description: overrides.description || 'A test badge description',
    iconName: overrides.iconName || 'trophy',
    gradientFrom: '#6366f1',
    gradientTo: '#8b5cf6',
    triggerType: overrides.triggerType || 'first_login',
    triggerValue: overrides.triggerValue,
    isActive: overrides.isActive ?? true,
  })
}

export async function createTestStudentBadge(
  studentId: Types.ObjectId,
  badgeId: Types.ObjectId,
  overrides: { earnedAt?: Date } = {}
) {
  return StudentBadge.create({
    studentId,
    badgeId,
    earnedAt: overrides.earnedAt || new Date(),
  })
}

// ============================================================================
// Shop Helpers
// ============================================================================

export async function createTestShopItem(createdBy: Types.ObjectId, overrides: {
  name?: string
  description?: string
  category?: ShopItemCategory
  price?: number
  isActive?: boolean
  isPermanent?: boolean
} = {}) {
  return ShopItem.create({
    name: overrides.name || `Test Shop Item ${Date.now()}`,
    description: overrides.description || 'A test shop item',
    category: overrides.category || 'avatar_pack',
    price: overrides.price ?? 100,
    isActive: overrides.isActive ?? true,
    isPermanent: overrides.isPermanent ?? true,
    createdBy,
  })
}

export async function createTestPurchase(
  studentId: Types.ObjectId,
  itemId: Types.ObjectId,
  price: number
) {
  return Purchase.create({
    studentId,
    itemId,
    price,
    purchasedAt: new Date(),
  })
}

// ============================================================================
// Sandbox Helpers
// ============================================================================

export async function createTestSandboxProject(studentId: Types.ObjectId, overrides: {
  name?: string
  description?: string
  language?: 'javascript' | 'python'
  code?: string
} = {}) {
  return SandboxProject.create({
    studentId,
    name: overrides.name || `Test Project ${Date.now()}`,
    description: overrides.description || 'A test sandbox project',
    language: overrides.language || 'javascript',
    code: overrides.code || '// Your code here',
  })
}

// ============================================================================
// Help Request Helpers
// ============================================================================

export async function createTestHelpRequest(
  studentId: Types.ObjectId,
  lessonId: Types.ObjectId,
  overrides: {
    classId?: Types.ObjectId
    exerciseId?: Types.ObjectId
    message?: string
    codeSnapshot?: string
    status?: HelpRequestStatus
    response?: string
    respondedAt?: Date
    assignedTeacherId?: Types.ObjectId
  } = {}
) {
  return HelpRequest.create({
    studentId,
    lessonId,
    classId: overrides.classId,
    exerciseId: overrides.exerciseId,
    message: overrides.message || 'I need help with this lesson',
    codeSnapshot: overrides.codeSnapshot,
    status: overrides.status || 'pending',
    response: overrides.response,
    respondedAt: overrides.respondedAt,
    assignedTeacherId: overrides.assignedTeacherId,
  })
}

// ============================================================================
// Notification Helpers
// ============================================================================

export async function createTestNotification(userId: Types.ObjectId, overrides: {
  type?: NotificationType
  title?: string
  message?: string
  read?: boolean
  data?: Record<string, unknown>
} = {}) {
  return Notification.create({
    userId,
    type: overrides.type || 'general',
    title: overrides.title || 'Test Notification',
    message: overrides.message || 'This is a test notification message',
    read: overrides.read ?? false,
    data: overrides.data,
  })
}
