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
  createTestExercise,
  createTestQuiz,
  createTestLessonProgress,
  createTestExerciseSubmission,
  createTestQuizSubmission,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'

describe('Student XP History API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/xp-history', () => {
    it('should return paginated XP history', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { xpReward: 10 })
      const lesson2 = await createTestLesson(section._id, { xpReward: 15 })
      const lesson3 = await createTestLesson(section._id, { xpReward: 20 })

      const { user: student } = await createTestStudent()

      // Complete lessons with XP
      await createTestLessonProgress(student._id, lesson1._id, { status: 'completed', xpEarned: 10 })
      await createTestLessonProgress(student._id, lesson2._id, { status: 'completed', xpEarned: 15 })
      await createTestLessonProgress(student._id, lesson3._id, { status: 'completed', xpEarned: 20 })

      const res = await request(app)
        .get('/api/student/xp-history')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(3)
      expect(res.body.meta).toBeDefined()
      expect(res.body.meta.total).toBe(3)
      expect(res.body.meta.page).toBe(1)
    })

    it('should filter by actionType', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 10 })
      const exercise = await createTestExercise(lesson._id, { xpReward: 15 })
      const quiz = await createTestQuiz(lesson._id, { xpReward: 25 })

      const { user: student } = await createTestStudent()

      // Complete different activities
      await createTestLessonProgress(student._id, lesson._id, { status: 'completed', xpEarned: 10 })
      await createTestExerciseSubmission(student._id, exercise._id, { passed: true, xpEarned: 15 })
      await createTestQuizSubmission(student._id, lesson._id, quiz._id, { passed: true, xpEarned: 25 })

      // Filter by exercise_complete
      const res = await request(app)
        .get('/api/student/xp-history?actionType=exercise_complete')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].actionType).toBe('exercise_complete')
      expect(res.body.data[0].amount).toBe(15)
    })

    it('should sort by date descending', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { xpReward: 10 })
      const lesson2 = await createTestLesson(section._id, { xpReward: 20 })
      const lesson3 = await createTestLesson(section._id, { xpReward: 30 })

      const { user: student } = await createTestStudent()

      // Complete lessons at different times
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-15')
      const date3 = new Date('2024-01-20')

      const progress1 = await createTestLessonProgress(student._id, lesson1._id, { status: 'completed', xpEarned: 10 })
      const progress2 = await createTestLessonProgress(student._id, lesson2._id, { status: 'completed', xpEarned: 20 })
      const progress3 = await createTestLessonProgress(student._id, lesson3._id, { status: 'completed', xpEarned: 30 })

      // Update completedAt dates manually for testing
      const { LessonProgress } = await import('../../../src/modules/progress/lessonProgress.model')
      await LessonProgress.findByIdAndUpdate(progress1._id, { completedAt: date1 })
      await LessonProgress.findByIdAndUpdate(progress2._id, { completedAt: date2 })
      await LessonProgress.findByIdAndUpdate(progress3._id, { completedAt: date3 })

      const res = await request(app)
        .get('/api/student/xp-history')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(3)
      // Most recent first
      expect(res.body.data[0].amount).toBe(30)
      expect(res.body.data[1].amount).toBe(20)
      expect(res.body.data[2].amount).toBe(10)
    })

    it('should support pagination with page and limit', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)

      const { user: student } = await createTestStudent()

      // Create 5 lessons with progress
      for (let i = 0; i < 5; i++) {
        const lesson = await createTestLesson(section._id, { xpReward: (i + 1) * 10 })
        await createTestLessonProgress(student._id, lesson._id, { status: 'completed', xpEarned: (i + 1) * 10 })
      }

      // Get page 1 with limit 2
      const res = await request(app)
        .get('/api/student/xp-history?page=1&limit=2')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.meta.total).toBe(5)
      expect(res.body.meta.page).toBe(1)
      expect(res.body.meta.limit).toBe(2)
      expect(res.body.meta.totalPages).toBe(3)
    })

    it('should return empty items when no XP earned', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get('/api/student/xp-history')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(0)
      expect(res.body.meta.total).toBe(0)
    })

    it('should include all XP types (lessons, exercises, quizzes)', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 10 })
      const exercise = await createTestExercise(lesson._id, { xpReward: 20 })
      const quiz = await createTestQuiz(lesson._id, { xpReward: 30 })

      const { user: student } = await createTestStudent()

      await createTestLessonProgress(student._id, lesson._id, { status: 'completed', xpEarned: 10 })
      await createTestExerciseSubmission(student._id, exercise._id, { passed: true, xpEarned: 20 })
      await createTestQuizSubmission(student._id, lesson._id, quiz._id, { passed: true, xpEarned: 30 })

      const res = await request(app)
        .get('/api/student/xp-history')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(3)

      const actionTypes = res.body.data.map((i: { actionType: string }) => i.actionType)
      expect(actionTypes).toContain('lesson_complete')
      expect(actionTypes).toContain('exercise_complete')
      expect(actionTypes).toContain('quiz_complete')
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/xp-history')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/xp-history')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })
})
