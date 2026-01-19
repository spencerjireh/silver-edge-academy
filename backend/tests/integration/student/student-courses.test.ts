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
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'
import { Types } from 'mongoose'

describe('Student Courses API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/courses', () => {
    it('should return enrolled courses with progress', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, {
        title: 'JavaScript Basics',
        language: 'javascript',
        status: 'published',
      })
      const section = await createTestSection(course._id, { title: 'Introduction' })
      const lesson1 = await createTestLesson(section._id, { status: 'published', orderIndex: 0 })
      const lesson2 = await createTestLesson(section._id, { status: 'published', orderIndex: 1 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        name: 'Test Class',
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      // Complete one lesson
      await createTestLessonProgress(student._id, lesson1._id, {
        status: 'completed',
        xpEarned: 10,
      })

      const res = await request(app)
        .get('/api/student/courses')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('JavaScript Basics')
      expect(res.body.data[0].language).toBe('javascript')
      expect(res.body.data[0].lessonsCompleted).toBe(1)
      expect(res.body.data[0].totalLessons).toBe(2)
      expect(res.body.data[0].progressPercent).toBe(50)
      expect(res.body.data[0].isAssigned).toBe(true)
    })

    it('should only return published courses', async () => {
      const admin = await createTestAdmin()
      const publishedCourse = await createTestCourse(admin._id, {
        title: 'Published Course',
        status: 'published',
      })
      const draftCourse = await createTestCourse(admin._id, {
        title: 'Draft Course',
        status: 'draft',
      })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [publishedCourse._id, draftCourse._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      const res = await request(app)
        .get('/api/student/courses')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Published Course')
    })

    it('should return empty array when student is not in a class', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get('/api/student/courses')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/courses')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/student/courses/:courseId', () => {
    it('should return course map with sections and lessons', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, {
        title: 'Python Basics',
        language: 'python',
        status: 'published',
      })
      const section1 = await createTestSection(course._id, { title: 'Getting Started', orderIndex: 0 })
      const section2 = await createTestSection(course._id, { title: 'Variables', orderIndex: 1 })
      const lesson1 = await createTestLesson(section1._id, { title: 'Lesson 1', status: 'published', orderIndex: 0, xpReward: 10 })
      const lesson2 = await createTestLesson(section1._id, { title: 'Lesson 2', status: 'published', orderIndex: 1, xpReward: 15 })
      const lesson3 = await createTestLesson(section2._id, { title: 'Lesson 3', status: 'published', orderIndex: 0, xpReward: 20 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      const res = await request(app)
        .get(`/api/student/courses/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Python Basics')
      expect(res.body.data.language).toBe('python')
      expect(res.body.data.sections).toHaveLength(2)
      expect(res.body.data.sections[0].title).toBe('Getting Started')
      expect(res.body.data.sections[0].lessons).toHaveLength(2)
      expect(res.body.data.sections[1].title).toBe('Variables')
      expect(res.body.data.sections[1].lessons).toHaveLength(1)
    })

    it('should show correct lesson status (completed/current/available)', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { status: 'published', orderIndex: 0 })
      const lesson2 = await createTestLesson(section._id, { status: 'published', orderIndex: 1 })
      const lesson3 = await createTestLesson(section._id, { status: 'published', orderIndex: 2 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      // Complete first lesson
      await createTestLessonProgress(student._id, lesson1._id, { status: 'completed' })

      const res = await request(app)
        .get(`/api/student/courses/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      const lessons = res.body.data.sections[0].lessons
      expect(lessons[0].status).toBe('completed')
      expect(lessons[1].status).toBe('current')
      expect(lessons[2].status).toBe('available')
    })

    it('should return 403 when student is not enrolled', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })

      const { user: student, profile } = await createTestStudent()
      // Create a class without this course
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [], // no courses assigned
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      const res = await request(app)
        .get(`/api/student/courses/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(403)
    })

    it('should return 403 when student is not in a class', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/courses/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(403)
    })

    it('should return 404 for non-existent course', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .get(`/api/student/courses/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should calculate overall progress percentage', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { status: 'published', orderIndex: 0 })
      const lesson2 = await createTestLesson(section._id, { status: 'published', orderIndex: 1 })
      const lesson3 = await createTestLesson(section._id, { status: 'published', orderIndex: 2 })
      const lesson4 = await createTestLesson(section._id, { status: 'published', orderIndex: 3 })

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        studentIds: [student._id],
        courseIds: [course._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      // Complete 2 of 4 lessons
      await createTestLessonProgress(student._id, lesson1._id, { status: 'completed' })
      await createTestLessonProgress(student._id, lesson2._id, { status: 'completed' })

      const res = await request(app)
        .get(`/api/student/courses/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.progressPercent).toBe(50)
    })
  })
})
