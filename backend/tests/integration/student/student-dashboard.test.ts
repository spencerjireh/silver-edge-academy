import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestClass,
  createTestLessonProgress,
  createTestExerciseSubmission,
  createTestQuizSubmission,
  createTestExercise,
  createTestQuiz,
  createTestBadge,
  createTestStudentBadge,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'

describe('Student Dashboard API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/dashboard', () => {
    it('should return all dashboard sections', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published', title: 'Test Course' })
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { status: 'published' })

      const { user: student, profile } = await createTestStudent({
        displayName: 'Test Student',
        username: 'teststudent',
      })

      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        classId: testClass._id,
        currentLevel: 5,
        totalXp: 500,
        currencyBalance: 100,
        currentStreakDays: 3,
      })

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('user')
      expect(res.body.data).toHaveProperty('activeCourses')
      expect(res.body.data).toHaveProperty('recentBadges')
      expect(res.body.data).toHaveProperty('stats')
    })

    it('should return correct user stats', async () => {
      const { user: student, profile } = await createTestStudent({
        displayName: 'Stats Student',
        username: 'statsstudent',
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        currentLevel: 10,
        totalXp: 1500,
        currencyBalance: 250,
        currentStreakDays: 7,
      })

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.user.displayName).toBe('Stats Student')
      expect(res.body.data.user.username).toBe('statsstudent')
      expect(res.body.data.user.currentLevel).toBe(10)
      expect(res.body.data.user.totalXp).toBe(1500)
      expect(res.body.data.user.currencyBalance).toBe(250)
      expect(res.body.data.user.currentStreakDays).toBe(7)
      expect(res.body.data.user.xpForNextLevel).toBeDefined()
      expect(res.body.data.user.xpProgress).toBeDefined()
    })

    it('should return active courses with progress', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, {
        title: 'JavaScript 101',
        language: 'javascript',
        status: 'published',
      })
      const section = await createTestSection(course._id, { title: 'Section 1' })
      const lesson1 = await createTestLesson(section._id, { status: 'published', orderIndex: 0 })
      const lesson2 = await createTestLesson(section._id, { status: 'published', orderIndex: 1 })
      const lesson3 = await createTestLesson(section._id, { status: 'published', orderIndex: 2 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      // Complete 2 of 3 lessons
      await createTestLessonProgress(student._id, lesson1._id, { status: 'completed' })
      await createTestLessonProgress(student._id, lesson2._id, { status: 'completed' })

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.activeCourses).toHaveLength(1)
      expect(res.body.data.activeCourses[0].title).toBe('JavaScript 101')
      expect(res.body.data.activeCourses[0].language).toBe('javascript')
      expect(res.body.data.activeCourses[0].lessonsCompleted).toBe(2)
      expect(res.body.data.activeCourses[0].totalLessons).toBe(3)
      expect(res.body.data.activeCourses[0].progressPercent).toBe(67) // Math.round(2/3 * 100)
      expect(res.body.data.activeCourses[0].currentLessonId).toBe(lesson3._id.toString())
    })

    it('should return recent badges', async () => {
      const { user: student, profile } = await createTestStudent()

      const badge1 = await createTestBadge({ name: 'First Steps' })
      const badge2 = await createTestBadge({ name: 'Quick Learner' })
      const badge3 = await createTestBadge({ name: 'Code Master' })

      // Earn badges at different times
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-15')
      const date3 = new Date('2024-01-20')

      await createTestStudentBadge(student._id, badge1._id, { earnedAt: date1 })
      await createTestStudentBadge(student._id, badge2._id, { earnedAt: date2 })
      await createTestStudentBadge(student._id, badge3._id, { earnedAt: date3 })

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.recentBadges).toHaveLength(3)
      // Should be sorted by earnedAt desc (most recent first)
      expect(res.body.data.recentBadges[0].name).toBe('Code Master')
      expect(res.body.data.recentBadges[1].name).toBe('Quick Learner')
      expect(res.body.data.recentBadges[2].name).toBe('First Steps')
    })

    it('should return aggregated stats', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id)
      const lesson2 = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson1._id)
      const quiz = await createTestQuiz(lesson1._id)

      const { user: student } = await createTestStudent()

      // Complete some lessons, exercises, and quizzes
      await createTestLessonProgress(student._id, lesson1._id, { status: 'completed' })
      await createTestLessonProgress(student._id, lesson2._id, { status: 'completed' })
      await createTestExerciseSubmission(student._id, exercise._id, { passed: true })
      await createTestQuizSubmission(student._id, lesson1._id, quiz._id, { passed: true })

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.stats.lessonsCompleted).toBe(2)
      expect(res.body.data.stats.exercisesPassed).toBe(1)
      expect(res.body.data.stats.quizzesPassed).toBe(1)
    })

    it('should suggest next badge to earn', async () => {
      const { user: student } = await createTestStudent()

      // Create some badges with different trigger values
      await createTestBadge({
        name: 'XP Beginner',
        triggerType: 'xp_earned',
        triggerValue: 100,
      })
      await createTestBadge({
        name: 'XP Intermediate',
        triggerType: 'xp_earned',
        triggerValue: 500,
      })
      await createTestBadge({
        name: 'XP Expert',
        triggerType: 'xp_earned',
        triggerValue: 1000,
      })

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.nextBadge).toBeDefined()
      expect(res.body.data.nextBadge.name).toBe('XP Beginner')
      expect(res.body.data.nextBadge.target).toBe(100)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/dashboard')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/dashboard')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })
})
