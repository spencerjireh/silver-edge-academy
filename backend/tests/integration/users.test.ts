import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import { createTestUser, createTestAdmin, createTestStudent } from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'

describe('Users API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/users', () => {
    it('should list users for admin', async () => {
      const admin = await createTestAdmin()
      await createTestStudent({ username: 'student1' })
      await createTestStudent({ username: 'student2' })

      const res = await request(app)
        .get('/api/users')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(3)
      expect(res.body.meta.total).toBe(3)
    })

    it('should filter users by role', async () => {
      const admin = await createTestAdmin()
      await createTestStudent({ username: 'student1' })
      await createTestStudent({ username: 'student2' })

      const res = await request(app)
        .get('/api/users?role=student')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
    })

    it('should return 403 for non-admin/teacher', async () => {
      const { user } = await createTestStudent()

      const res = await request(app)
        .get('/api/users')
        .set(getAuthHeader(user))

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/users', () => {
    it('should create a new student', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .post('/api/users')
        .set(getAuthHeader(admin))
        .send({
          username: 'newstudent',
          password: 'password123',
          displayName: 'New Student',
          role: 'student',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.username).toBe('newstudent')
      expect(res.body.data.displayName).toBe('New Student')
      expect(res.body.data.role).toBe('student')
    })

    it('should create a new teacher', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .post('/api/users')
        .set(getAuthHeader(admin))
        .send({
          email: 'teacher@example.com',
          password: 'password123',
          displayName: 'New Teacher',
          role: 'teacher',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.email).toBe('teacher@example.com')
      expect(res.body.data.role).toBe('teacher')
    })

    it('should return 409 for duplicate email', async () => {
      const admin = await createTestAdmin()
      await createTestUser({ email: 'existing@example.com' })

      const res = await request(app)
        .post('/api/users')
        .set(getAuthHeader(admin))
        .send({
          email: 'existing@example.com',
          password: 'password123',
          displayName: 'Duplicate',
          role: 'teacher',
        })

      expect(res.status).toBe(409)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent({ displayName: 'Test Student' })

      const res = await request(app)
        .get(`/api/users/${student._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(200)
      expect(res.body.data.displayName).toBe('Test Student')
    })

    it('should return 404 for non-existent user', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/users/000000000000000000000000')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/users/:id', () => {
    it('should update user', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .patch(`/api/users/${student._id}`)
        .set(getAuthHeader(admin))
        .send({ displayName: 'Updated Name' })

      expect(res.status).toBe(200)
      expect(res.body.data.displayName).toBe('Updated Name')
    })

    it('should allow user to update own profile', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .patch(`/api/users/${student._id}`)
        .set(getAuthHeader(student))
        .send({ displayName: 'My New Name' })

      expect(res.status).toBe(200)
      expect(res.body.data.displayName).toBe('My New Name')
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should deactivate user', async () => {
      const admin = await createTestAdmin()
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .delete(`/api/users/${student._id}`)
        .set(getAuthHeader(admin))

      expect(res.status).toBe(204)
    })

    it('should return 403 for non-admin', async () => {
      const { user: student1 } = await createTestStudent({ username: 'student1' })
      const { user: student2 } = await createTestStudent({ username: 'student2' })

      const res = await request(app)
        .delete(`/api/users/${student2._id}`)
        .set(getAuthHeader(student1))

      expect(res.status).toBe(403)
    })
  })
})
