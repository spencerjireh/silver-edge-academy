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
  createTestExercise,
  createTestQuiz,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'

describe('Lessons API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/courses/:courseId/sections/:sectionId/lessons', () => {
    it('should list lessons sorted by orderIndex', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      await createTestLesson(section._id, { title: 'Lesson 2', orderIndex: 1 })
      await createTestLesson(section._id, { title: 'Lesson 1', orderIndex: 0 })

      const res = await request(app)
        .get(`/api/courses/${course._id}/sections/${section._id}/lessons`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].title).toBe('Lesson 1')
      expect(res.body.data[1].title).toBe('Lesson 2')
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)

      const res = await request(app)
        .get(`/api/courses/${course._id}/sections/${section._id}/lessons`)

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/courses/:courseId/sections/:sectionId/lessons', () => {
    it('should create lesson with auto orderIndex', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      await createTestLesson(section._id, { orderIndex: 0 })

      const res = await request(app)
        .post(`/api/courses/${course._id}/sections/${section._id}/lessons`)
        .set(getAuthHeader(admin))
        .send({
          title: 'New Lesson',
          content: '# Content',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.title).toBe('New Lesson')
      expect(res.body.data.orderIndex).toBe(1)
    })

    it('should create lesson with specified orderIndex', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)

      const res = await request(app)
        .post(`/api/courses/${course._id}/sections/${section._id}/lessons`)
        .set(getAuthHeader(admin))
        .send({
          title: 'New Lesson',
          content: '# Content',
          orderIndex: 5,
        })

      expect(res.status).toBe(201)
      expect(res.body.data.orderIndex).toBe(5)
    })

    it('should return 403 for non-admin', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)

      const res = await request(app)
        .post(`/api/courses/${course._id}/sections/${section._id}/lessons`)
        .set(getAuthHeader(student))
        .send({
          title: 'New Lesson',
          content: '# Content',
        })

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/courses/:courseId/sections/:sectionId/lessons/:lessonId', () => {
    it('should get lesson with exercises and quiz', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { title: 'Test Lesson' })
      await createTestExercise(lesson._id, { title: 'Exercise 1' })
      await createTestQuiz(lesson._id, { title: 'Quiz 1' })

      const res = await request(app)
        .get(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Test Lesson')
      expect(res.body.data.exercises).toHaveLength(1)
      expect(res.body.data.exercises[0].title).toBe('Exercise 1')
      expect(res.body.data.quiz).toBeDefined()
      expect(res.body.data.quiz.title).toBe('Quiz 1')
    })

    it('should return 404 for non-existent lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)

      const res = await request(app)
        .get(`/api/courses/${course._id}/sections/${section._id}/lessons/000000000000000000000000`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/courses/:courseId/sections/:sectionId/lessons/:lessonId', () => {
    it('should update lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { title: 'Old Title' })

      const res = await request(app)
        .patch(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}`)
        .set(getAuthHeader(admin))
        .send({ title: 'New Title' })

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('New Title')
    })

    it('should return 403 for non-admin', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const res = await request(app)
        .patch(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}`)
        .set(getAuthHeader(student))
        .send({ title: 'New Title' })

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /api/courses/:courseId/sections/:sectionId/lessons/:lessonId', () => {
    it('should delete lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const res = await request(app)
        .delete(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)

      // Verify lesson is deleted
      const getRes = await request(app)
        .get(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}`)
        .set(getAuthHeader(admin))

      expect(getRes.status).toBe(404)
    })

    it('should cascade delete exercises and quiz', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      await createTestExercise(lesson._id)
      await createTestQuiz(lesson._id)

      const res = await request(app)
        .delete(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)
    })
  })

  describe('PATCH /api/courses/:courseId/sections/:sectionId/lessons/reorder', () => {
    it('should reorder lessons', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson1 = await createTestLesson(section._id, { title: 'Lesson 1', orderIndex: 0 })
      const lesson2 = await createTestLesson(section._id, { title: 'Lesson 2', orderIndex: 1 })
      const lesson3 = await createTestLesson(section._id, { title: 'Lesson 3', orderIndex: 2 })

      const res = await request(app)
        .patch(`/api/courses/${course._id}/sections/${section._id}/lessons/reorder`)
        .set(getAuthHeader(admin))
        .send({
          lessonIds: [lesson3._id.toString(), lesson1._id.toString(), lesson2._id.toString()],
        })

      expect(res.status).toBe(200)

      // Verify order by fetching lessons
      const listRes = await request(app)
        .get(`/api/courses/${course._id}/sections/${section._id}/lessons`)
        .set(getAuthHeader(admin))

      expect(listRes.body.data[0].title).toBe('Lesson 3')
      expect(listRes.body.data[1].title).toBe('Lesson 1')
      expect(listRes.body.data[2].title).toBe('Lesson 2')
    })
  })

  describe('POST /api/courses/:courseId/sections/:sectionId/lessons/:lessonId/lock', () => {
    it('should acquire lock on lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const res = await request(app)
        .post(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}/lock`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.lockedBy).toBe(admin._id.toString())
      expect(res.body.data.lockedAt).toBeDefined()
    })
  })

  describe('DELETE /api/courses/:courseId/sections/:sectionId/lessons/:lessonId/lock', () => {
    it('should release lock on lesson', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      // First acquire the lock
      await request(app)
        .post(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}/lock`)
        .set(getAuthHeader(admin))

      // Then release it
      const res = await request(app)
        .delete(`/api/courses/${course._id}/sections/${section._id}/lessons/${lesson._id}/lock`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)
    })
  })
})
