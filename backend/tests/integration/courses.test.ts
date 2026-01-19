import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import {
  createTestAdmin,
  createTestStudent,
  createTestCourse,
  createTestSection,
  createTestClass,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'

describe('Courses API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/courses', () => {
    it('should list courses for authenticated user', async () => {
      const admin = await createTestAdmin()
      await createTestCourse(admin._id, { title: 'Course 1' })
      await createTestCourse(admin._id, { title: 'Course 2' })

      const res = await request(app)
        .get('/api/courses')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.meta.total).toBe(2)
    })

    it('should filter courses by status', async () => {
      const admin = await createTestAdmin()
      await createTestCourse(admin._id, { title: 'Draft', status: 'draft' })
      await createTestCourse(admin._id, { title: 'Published', status: 'published' })

      const res = await request(app)
        .get('/api/courses?status=published')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Published')
    })

    it('should filter courses by language', async () => {
      const admin = await createTestAdmin()
      await createTestCourse(admin._id, { title: 'JS Course', language: 'javascript' })
      await createTestCourse(admin._id, { title: 'Python Course', language: 'python' })

      const res = await request(app)
        .get('/api/courses?language=python')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Python Course')
    })

    it('should paginate results', async () => {
      const admin = await createTestAdmin()
      for (let i = 0; i < 15; i++) {
        await createTestCourse(admin._id, { title: `Course ${i}` })
      }

      const res = await request(app)
        .get('/api/courses?page=1&limit=5')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(5)
      expect(res.body.meta.total).toBe(15)
      expect(res.body.meta.totalPages).toBe(3)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/courses')

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/courses', () => {
    it('should create a course as admin', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .post('/api/courses')
        .set(getAuthHeader(admin))
        .send({
          title: 'New Course',
          description: 'A test course',
          language: 'javascript',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.title).toBe('New Course')
      expect(res.body.data.description).toBe('A test course')
      expect(res.body.data.language).toBe('javascript')
      expect(res.body.data.status).toBe('draft')
    })

    it('should return 403 for non-admin', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/courses')
        .set(getAuthHeader(student))
        .send({
          title: 'New Course',
          language: 'javascript',
        })

      expect(res.status).toBe(403)
    })

    it('should return 422 for invalid input', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .post('/api/courses')
        .set(getAuthHeader(admin))
        .send({
          title: '', // empty title
          language: 'invalid',
        })

      expect(res.status).toBe(422)
    })
  })

  describe('GET /api/courses/:id', () => {
    it('should get course with sections and lessons', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { title: 'Test Course' })
      const section = await createTestSection(course._id, { title: 'Section 1' })

      const res = await request(app)
        .get(`/api/courses/${course._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Test Course')
      expect(res.body.data.sections).toHaveLength(1)
      expect(res.body.data.sections[0].title).toBe('Section 1')
    })

    it('should return 404 for non-existent course', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/courses/000000000000000000000000')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/courses/:id', () => {
    it('should update course', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { title: 'Old Title' })

      const res = await request(app)
        .patch(`/api/courses/${course._id}`)
        .set(getAuthHeader(admin))
        .send({ title: 'New Title' })

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('New Title')
    })

    it('should return 403 for non-admin', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const course = await createTestCourse(admin._id)

      const res = await request(app)
        .patch(`/api/courses/${course._id}`)
        .set(getAuthHeader(student))
        .send({ title: 'New Title' })

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /api/courses/:id', () => {
    it('should delete course with cascade', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      await createTestSection(course._id, { title: 'Section 1' })

      const res = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)

      // Verify course is deleted
      const getRes = await request(app)
        .get(`/api/courses/${course._id}`)
        .set(getAuthHeader(admin))

      expect(getRes.status).toBe(404)
    })

    it('should return 409 if course is assigned to a class', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      await createTestClass(undefined, { courseIds: [course._id] })

      const res = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(409)
    })

    it('should return 403 for non-admin', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()
      const course = await createTestCourse(admin._id)

      const res = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(403)
    })
  })

  describe('PATCH /api/courses/:id/publish', () => {
    it('should publish course with sections', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'draft' })
      await createTestSection(course._id)

      const res = await request(app)
        .patch(`/api/courses/${course._id}/publish`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('published')
    })

    it('should return 400 when publishing course without sections', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'draft' })

      const res = await request(app)
        .patch(`/api/courses/${course._id}/publish`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(400)
    })

    it('should return 400 when publishing already published course', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })

      const res = await request(app)
        .patch(`/api/courses/${course._id}/publish`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(400)
    })
  })

  describe('PATCH /api/courses/:id/unpublish', () => {
    it('should unpublish course', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'published' })

      const res = await request(app)
        .patch(`/api/courses/${course._id}/unpublish`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('draft')
    })

    it('should return 400 when unpublishing draft course', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id, { status: 'draft' })

      const res = await request(app)
        .patch(`/api/courses/${course._id}/unpublish`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(400)
    })
  })
})
