import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse'
import type { AuthenticatedRequest } from '../../middleware/auth'
import * as studentService from './student.service'
import type {
  StudentLoginInput,
  StudentLogoutInput,
  UpdateProfileInput,
  CourseIdParam,
  LessonIdParam,
  ExerciseIdParam,
  QuizIdParam,
  SubmitExerciseInput,
  SubmitQuizInput,
  PurchaseItemInput,
  EquipItemInput,
  XpHistoryQuery,
  NotificationIdParam,
} from './student.schema'

// ============================================================================
// Auth Controllers
// ============================================================================

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as StudentLoginInput
  const result = await studentService.studentLogin(input)
  sendSuccess(res, result)
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as StudentLogoutInput
  await studentService.studentLogout(input.refreshToken)
  sendSuccess(res, { message: 'Logged out successfully' })
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const result = await studentService.getStudentMe(authReq.user.userId)
  sendSuccess(res, result)
})

// ============================================================================
// Dashboard Controller
// ============================================================================

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const result = await studentService.getStudentDashboard(authReq.user.userId)
  sendSuccess(res, result)
})

// ============================================================================
// Course Controllers
// ============================================================================

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const courses = await studentService.getStudentCourses(authReq.user.userId)
  sendSuccess(res, courses)
})

export const getCourseMap = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as CourseIdParam
  const courseMap = await studentService.getStudentCourseMap(authReq.user.userId, params.courseId)
  sendSuccess(res, courseMap)
})

// ============================================================================
// Lesson Controllers
// ============================================================================

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as LessonIdParam
  const lesson = await studentService.getLessonContent(authReq.user.userId, params.lessonId)
  sendSuccess(res, lesson)
})

export const completeLessonHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as LessonIdParam
  const result = await studentService.completeLesson(authReq.user.userId, params.lessonId)
  sendSuccess(res, result)
})

// ============================================================================
// Exercise Controllers
// ============================================================================

export const getExercise = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as ExerciseIdParam
  const exercise = await studentService.getExercise(authReq.user.userId, params.exerciseId)
  sendSuccess(res, exercise)
})

export const submitExerciseHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as ExerciseIdParam
  const input = req.body as SubmitExerciseInput
  const result = await studentService.submitExercise(authReq.user.userId, params.exerciseId, input)
  sendSuccess(res, result)
})

// ============================================================================
// Quiz Controllers
// ============================================================================

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as QuizIdParam
  const quiz = await studentService.getQuiz(authReq.user.userId, params.quizId)
  sendSuccess(res, quiz)
})

export const submitQuizHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as QuizIdParam
  const input = req.body as SubmitQuizInput
  const result = await studentService.submitQuiz(authReq.user.userId, params.quizId, input)
  sendSuccess(res, result)
})

// ============================================================================
// Badge Controller
// ============================================================================

export const getBadges = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const badges = await studentService.getStudentBadges(authReq.user.userId)
  sendSuccess(res, badges)
})

// ============================================================================
// XP History Controller
// ============================================================================

export const getXpHistory = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const query = req.query as unknown as XpHistoryQuery
  const result = await studentService.getXpHistory(authReq.user.userId, query)
  sendPaginated(res, result.items, result.meta)
})

// ============================================================================
// Shop Controllers
// ============================================================================

export const getShopItems = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const items = await studentService.getStudentShopItems(authReq.user.userId)
  sendSuccess(res, items)
})

export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const items = await studentService.getStudentInventory(authReq.user.userId)
  sendSuccess(res, items)
})

export const purchaseItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as PurchaseItemInput
  const result = await studentService.purchaseItem(authReq.user.userId, input.itemId)
  sendSuccess(res, result)
})

export const equipItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as EquipItemInput
  const result = await studentService.equipItem(authReq.user.userId, input)
  sendSuccess(res, result)
})

// ============================================================================
// Profile Controllers
// ============================================================================

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const profileData = await studentService.getStudentProfilePage(authReq.user.userId)
  sendSuccess(res, profileData)
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as UpdateProfileInput
  const profile = await studentService.updateProfile(authReq.user.userId, input)
  sendSuccess(res, profile)
})

// ============================================================================
// Notification Controllers (placeholder - to be implemented with notifications module)
// ============================================================================

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  // Will be implemented with notifications module
  sendSuccess(res, [])
})

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const _params = req.params as unknown as NotificationIdParam
  // Will be implemented with notifications module
  sendSuccess(res, { success: true })
})
