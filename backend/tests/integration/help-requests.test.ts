import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestExercise,
  createTestHelpRequest,
  createTestClass,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'
import { HelpRequest } from '../../src/modules/helpRequests/helpRequest.model'
import { StudentProfile } from '../../src/modules/users/studentProfile.model'
import { Types } from 'mongoose'

describe('Help Requests API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/help-requests', () => {
    it('should list only own requests', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      await createTestHelpRequest(student1._id, lesson._id, { message: 'My request 1' })
      await createTestHelpRequest(student1._id, lesson._id, { message: 'My request 2' })
      await createTestHelpRequest(student2._id, lesson._id, { message: 'Other student request' })

      const res = await request(app)
        .get('/api/student/help-requests')
        .set(getAuthHeader(student1))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      const messages = res.body.data.map((r: { message: string }) => r.message)
      expect(messages).toContain('My request 1')
      expect(messages).toContain('My request 2')
      expect(messages).not.toContain('Other student request')
    })

    it('should support pagination', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student } = await createTestStudent()

      for (let i = 0; i < 5; i++) {
        await createTestHelpRequest(student._id, lesson._id, { message: `Request ${i + 1}` })
      }

      const res = await request(app)
        .get('/api/student/help-requests?page=1&limit=2')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.meta.total).toBe(5)
      expect(res.body.meta.page).toBe(1)
      expect(res.body.meta.totalPages).toBe(3)
    })

    it('should filter by status', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student } = await createTestStudent()

      await createTestHelpRequest(student._id, lesson._id, { status: 'pending', message: 'Pending' })
      await createTestHelpRequest(student._id, lesson._id, { status: 'resolved', message: 'Resolved' })
      await createTestHelpRequest(student._id, lesson._id, { status: 'pending', message: 'Pending 2' })

      const res = await request(app)
        .get('/api/student/help-requests?status=pending')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data.every((r: { status: string }) => r.status === 'pending')).toBe(true)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/help-requests')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/help-requests')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/student/help-requests', () => {
    it('should create a help request', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/help-requests')
        .set(getAuthHeader(student))
        .send({
          lessonId: lesson._id.toString(),
          message: 'I need help understanding loops',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.message).toBe('I need help understanding loops')
      expect(res.body.data.lessonId).toBe(lesson._id.toString())
      expect(res.body.data.status).toBe('pending')
      expect(res.body.data.id).toBeDefined() // id is the help request ID
    })

    it('should create request with exercise reference', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id)

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/help-requests')
        .set(getAuthHeader(student))
        .send({
          lessonId: lesson._id.toString(),
          exerciseId: exercise._id.toString(),
          message: 'Stuck on this exercise',
          codeSnapshot: 'const x = 1;',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.exerciseId).toBe(exercise._id.toString())
      expect(res.body.data.codeSnapshot).toBe('const x = 1;')
    })

    it('should include classId from student profile', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student, profile } = await createTestStudent()
      const testClass = await createTestClass(undefined, {
        name: 'Test Class',
        studentIds: [student._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { classId: testClass._id })

      const res = await request(app)
        .post('/api/student/help-requests')
        .set(getAuthHeader(student))
        .send({
          lessonId: lesson._id.toString(),
          message: 'Help please',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.status).toBe('pending')
    })

    it('should return 422 for missing required fields', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/help-requests')
        .set(getAuthHeader(student))
        .send({ message: 'No lessonId' })

      expect(res.status).toBe(422)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const res = await request(app)
        .post('/api/student/help-requests')
        .send({
          lessonId: lesson._id.toString(),
          message: 'Help',
        })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/student/help-requests/:requestId', () => {
    it('should return own request with response if answered', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student } = await createTestStudent()

      const helpRequest = await createTestHelpRequest(student._id, lesson._id, {
        message: 'My question',
        status: 'resolved',
        response: 'Here is the answer',
        respondedAt: new Date(),
      })

      const res = await request(app)
        .get(`/api/student/help-requests/${helpRequest._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.message).toBe('My question')
      expect(res.body.data.response).toBe('Here is the answer')
      expect(res.body.data.status).toBe('resolved')
      expect(res.body.data.respondedAt).toBeDefined()
    })

    it('should return 404 for other students request', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      const helpRequest = await createTestHelpRequest(student2._id, lesson._id, {
        message: 'Other student question',
      })

      const res = await request(app)
        .get(`/api/student/help-requests/${helpRequest._id}`)
        .set(getAuthHeader(student1))

      expect(res.status).toBe(404)
    })

    it('should return 404 for non-existent request', async () => {
      const { user: student } = await createTestStudent()
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .get(`/api/student/help-requests/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student } = await createTestStudent()
      const helpRequest = await createTestHelpRequest(student._id, lesson._id)

      const res = await request(app).get(`/api/student/help-requests/${helpRequest._id}`)

      expect(res.status).toBe(401)
    })
  })
})
