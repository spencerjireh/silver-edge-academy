import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import {
  createTestAdmin,
  createTestStudent,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestClass,
  createTestLessonProgress,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'
import { StudentProfile } from '../../src/modules/users/studentProfile.model'

describe('Progress API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/students/:id/progress', () => {
    it('should get student progress summary', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { status: 'published' })
      const lesson2 = await createTestLesson(section._id, { status: 'published', orderIndex: 1 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      // Update student profile with class and XP
      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id, totalXp: 10 })

      // Create progress for one lesson
      await createTestLessonProgress(student._id, lesson1._id, {
        status: 'completed',
        xpEarned: 10,
      })

      const res = await request(app)
        .get(`/api/students/${student._id}/progress`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.totalXpEarned).toBe(10)
      expect(res.body.data.completedLessons).toBe(1)
    })

    it('should return 401 without authentication', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/students/${student._id}/progress`)

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/students/:id/progress/course/:courseId', () => {
    it('should get course progress for student', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { status: 'published' })
      const lesson2 = await createTestLesson(section._id, { status: 'published', orderIndex: 1 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      // Complete one of two lessons
      await createTestLessonProgress(student._id, lesson1._id, {
        status: 'completed',
        xpEarned: 10,
      })

      const res = await request(app)
        .get(`/api/students/${student._id}/progress/course/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.courseId).toBe(course._id.toString())
      expect(res.body.data.completedLessons).toBe(1)
      expect(res.body.data.totalLessons).toBe(2)
      expect(res.body.data.progressPercent).toBe(50)
    })
  })

  describe('POST /api/progress/lesson/:lessonId/start', () => {
    it('should start a lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('in_progress')
      expect(res.body.data.startedAt).toBeDefined()
    })

    it('should not create duplicate progress on restart', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const { user: student } = await createTestStudent()

      // Start once
      await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      // Start again
      const res = await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('in_progress')
    })
  })

  describe('POST /api/progress/lesson/:lessonId/complete', () => {
    it('should complete a lesson and award XP', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 20 })
      const { user: student, profile } = await createTestStudent()

      // Start the lesson first
      await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      // Complete the lesson
      const res = await request(app)
        .post(`/api/progress/lesson/${lesson._id}/complete`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('completed')
      expect(res.body.data.completedAt).toBeDefined()
      expect(res.body.data.xpEarned).toBe(20)

      // Verify student XP was updated
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(20)
    })

    it('should only award XP once for completing same lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 20 })
      const { user: student, profile } = await createTestStudent()

      // Start and complete
      await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      await request(app)
        .post(`/api/progress/lesson/${lesson._id}/complete`)
        .set(getAuthHeader(student))

      // Complete again
      const res = await request(app)
        .post(`/api/progress/lesson/${lesson._id}/complete`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)

      // Verify XP was only awarded once
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(20)
    })
  })

  describe('PATCH /api/progress/lesson/:lessonId/time', () => {
    it('should update time spent on lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const { user: student } = await createTestStudent()

      // Start the lesson
      await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      // Update time spent
      const res = await request(app)
        .patch(`/api/progress/lesson/${lesson._id}/time`)
        .set(getAuthHeader(student))
        .send({ timeSpentSeconds: 120 })

      expect(res.status).toBe(200)
      expect(res.body.data.timeSpentSeconds).toBe(120)
    })

    it('should accumulate time spent', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const { user: student } = await createTestStudent()

      // Start the lesson
      await request(app)
        .post(`/api/progress/lesson/${lesson._id}/start`)
        .set(getAuthHeader(student))

      // Update time spent twice
      await request(app)
        .patch(`/api/progress/lesson/${lesson._id}/time`)
        .set(getAuthHeader(student))
        .send({ timeSpentSeconds: 60 })

      const res = await request(app)
        .patch(`/api/progress/lesson/${lesson._id}/time`)
        .set(getAuthHeader(student))
        .send({ timeSpentSeconds: 60 })

      expect(res.status).toBe(200)
      expect(res.body.data.timeSpentSeconds).toBe(120)
    })
  })

  describe('GET /api/progress/lesson/:lessonId', () => {
    it('should get lesson progress', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const { user: student } = await createTestStudent()

      // Create progress
      await createTestLessonProgress(student._id, lesson._id, {
        status: 'in_progress',
        timeSpentSeconds: 300,
      })

      const res = await request(app)
        .get(`/api/progress/lesson/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('in_progress')
      expect(res.body.data.timeSpentSeconds).toBe(300)
    })

    it('should return not_started status for new lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/progress/lesson/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('not_started')
    })
  })
})
