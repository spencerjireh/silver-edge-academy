import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import {
  createTestAdmin,
  createTestTeacher,
  createTestStudent,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestClass,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'

describe('Classes API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/classes', () => {
    it('should list classes for admin', async () => {
      const admin = await createTestAdmin()
      await createTestClass(undefined, { name: 'Class 1' })
      await createTestClass(undefined, { name: 'Class 2' })

      const res = await request(app)
        .get('/api/classes')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
    })

    it('should list classes for teacher', async () => {
      const { user: teacher } = await createTestTeacher()
      await createTestClass(teacher._id, { name: 'Class 1' })

      const res = await request(app)
        .get('/api/classes')
        .set(getAuthHeader(teacher))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
    })

    it('should return 403 for student', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get('/api/classes')
        .set(getAuthHeader(student))

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/classes', () => {
    it('should create a class as admin', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .post('/api/classes')
        .set(getAuthHeader(admin))
        .send({
          name: 'New Class',
          description: 'A test class',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.name).toBe('New Class')
      expect(res.body.data.status).toBe('active')
    })

    it('should create a class with teacher assigned', async () => {
      const admin = await createTestAdmin()
      const { user: teacher } = await createTestTeacher()

      const res = await request(app)
        .post('/api/classes')
        .set(getAuthHeader(admin))
        .send({
          name: 'New Class',
          teacherId: teacher._id.toString(),
        })

      expect(res.status).toBe(201)
      expect(res.body.data.teacherId).toBe(teacher._id.toString())
    })

    it('should return 403 for non-admin', async () => {
      const { user: teacher } = await createTestTeacher()

      const res = await request(app)
        .post('/api/classes')
        .set(getAuthHeader(teacher))
        .send({ name: 'New Class' })

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/classes/:id', () => {
    it('should get class by id', async () => {
      const admin = await createTestAdmin()
      const testClass = await createTestClass(undefined, { name: 'Test Class' })

      const res = await request(app)
        .get(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Test Class')
    })

    it('should return 404 for non-existent class', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/classes/000000000000000000000000')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/classes/:id', () => {
    it('should update class as admin', async () => {
      const admin = await createTestAdmin()
      const testClass = await createTestClass(undefined, { name: 'Old Name' })

      const res = await request(app)
        .patch(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))
        .send({ name: 'New Name' })

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('New Name')
    })

    it('should update class as teacher', async () => {
      const { user: teacher } = await createTestTeacher()
      const testClass = await createTestClass(teacher._id, { name: 'Old Name' })

      const res = await request(app)
        .patch(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(teacher))
        .send({ description: 'New description' })

      expect(res.status).toBe(200)
      expect(res.body.data.description).toBe('New description')
    })
  })

  describe('DELETE /api/classes/:id', () => {
    it('should archive class as admin', async () => {
      const admin = await createTestAdmin()
      const testClass = await createTestClass(undefined)

      const res = await request(app)
        .delete(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)
    })

    it('should return 403 for teacher', async () => {
      const { user: teacher } = await createTestTeacher()
      const testClass = await createTestClass(teacher._id)

      const res = await request(app)
        .delete(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(teacher))

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/classes/:id/students', () => {
    it('should add student to class', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const testClass = await createTestClass(undefined)

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/students`)
        .set(getAuthHeader(admin))
        .send({ studentId: student._id.toString() })

      expect(res.status).toBe(200)
      expect(res.body.data.message).toBe('Student added to class')

      // Verify student was added by fetching the class
      const getRes = await request(app)
        .get(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))

      expect(getRes.body.data.studentIds).toContain(student._id.toString())
    })

    it('should return 400 for non-existent student', async () => {
      const admin = await createTestAdmin()
      const testClass = await createTestClass(undefined)

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/students`)
        .set(getAuthHeader(admin))
        .send({ studentId: '000000000000000000000000' })

      expect(res.status).toBe(400)
    })

    it('should return 409 for duplicate student', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const testClass = await createTestClass(undefined, { studentIds: [student._id] })

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/students`)
        .set(getAuthHeader(admin))
        .send({ studentId: student._id.toString() })

      expect(res.status).toBe(409)
    })
  })

  describe('DELETE /api/classes/:id/students/:studentId', () => {
    it('should remove student from class', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const testClass = await createTestClass(undefined, { studentIds: [student._id] })

      const res = await request(app)
        .delete(`/api/classes/${testClass._id}/students/${student._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)

      // Verify student was removed by fetching the class
      const getRes = await request(app)
        .get(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))

      expect(getRes.body.data.studentIds).not.toContain(student._id.toString())
    })
  })

  describe('POST /api/classes/:id/courses', () => {
    it('should add course to class', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const testClass = await createTestClass(undefined)

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/courses`)
        .set(getAuthHeader(admin))
        .send({ courseId: course._id.toString() })

      expect(res.status).toBe(200)
      expect(res.body.data.message).toBe('Course assigned to class')

      // Verify course was added by fetching the class
      const getRes = await request(app)
        .get(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))

      expect(getRes.body.data.courseIds).toContain(course._id.toString())
    })

    it('should return 404 for non-existent course', async () => {
      const admin = await createTestAdmin()
      const testClass = await createTestClass(undefined)

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/courses`)
        .set(getAuthHeader(admin))
        .send({ courseId: '000000000000000000000000' })

      expect(res.status).toBe(404)
    })

    it('should return 409 for duplicate course', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const testClass = await createTestClass(undefined, { courseIds: [course._id] })

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/courses`)
        .set(getAuthHeader(admin))
        .send({ courseId: course._id.toString() })

      expect(res.status).toBe(409)
    })
  })

  describe('DELETE /api/classes/:id/courses/:courseId', () => {
    it('should remove course from class', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const testClass = await createTestClass(undefined, { courseIds: [course._id] })

      const res = await request(app)
        .delete(`/api/classes/${testClass._id}/courses/${course._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)

      // Verify course was removed by fetching the class
      const getRes = await request(app)
        .get(`/api/classes/${testClass._id}`)
        .set(getAuthHeader(admin))

      expect(getRes.body.data.courseIds).not.toContain(course._id.toString())
    })
  })

  describe('POST /api/classes/:id/unlock-lesson/:lessonId', () => {
    it('should unlock lesson for class', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const testClass = await createTestClass(undefined, { courseIds: [course._id] })

      const res = await request(app)
        .post(`/api/classes/${testClass._id}/unlock-lesson/${lesson._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/classes/:id/unlocked-lessons', () => {
    it('should get unlocked lessons for class', async () => {
      const admin = await createTestAdmin()
      const testClass = await createTestClass(undefined)

      const res = await request(app)
        .get(`/api/classes/${testClass._id}/unlocked-lessons`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })
})
