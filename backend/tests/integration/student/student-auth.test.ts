import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup'
import { createTestStudent, createTestAdmin, createTestClass } from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'

describe('Student Auth API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/student/auth/login', () => {
    it('should login with valid credentials and return student data with gamification stats', async () => {
      const { user: student, profile } = await createTestStudent({
        username: 'teststudent',
      })

      // Update profile with some gamification stats
      await StudentProfile.findByIdAndUpdate(profile._id, {
        currentLevel: 5,
        totalXp: 500,
        currencyBalance: 100,
        currentStreakDays: 3,
      })

      const res = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'teststudent', password: 'testpassword123' })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('accessToken')
      expect(res.body.data).toHaveProperty('refreshToken')
      expect(res.body.data.username).toBe('teststudent')
      expect(res.body.data.role).toBe('student')
      expect(res.body.data.currentLevel).toBe(5)
      expect(res.body.data.totalXp).toBe(500)
      expect(res.body.data.currencyBalance).toBe(100)
      expect(res.body.data.currentStreakDays).toBe(3)
    })

    it('should include class info when student is in a class', async () => {
      const { user: student, profile } = await createTestStudent({
        username: 'classedstudent',
      })

      const testClass = await createTestClass(undefined, {
        name: 'Test Class A',
        studentIds: [student._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        classId: testClass._id,
      })

      const res = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'classedstudent', password: 'testpassword123' })

      expect(res.status).toBe(200)
      expect(res.body.data.classId).toBe(testClass._id.toString())
      expect(res.body.data.className).toBe('Test Class A')
    })

    it('should return 401 for invalid credentials', async () => {
      await createTestStudent({ username: 'teststudent' })

      const res = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'teststudent', password: 'wrongpassword' })

      expect(res.status).toBe(401)
    })

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'nonexistent', password: 'testpassword123' })

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role trying to use student login', async () => {
      await createTestAdmin({ email: 'admin@test.com' })

      // Admin uses email, not username. Try logging in with admin through student endpoint
      // First create an admin with a username (by creating user directly)
      const { createTestUser } = await import('../../helpers/db')
      await createTestUser({
        username: 'adminuser',
        email: 'adminuser@test.com',
        password: 'testpassword123',
        role: 'admin',
      })

      const res = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'adminuser', password: 'testpassword123' })

      expect(res.status).toBe(403)
    })

    it('should return 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'teststudent' }) // missing password

      expect(res.status).toBe(422)
    })
  })

  describe('POST /api/student/auth/logout', () => {
    it('should logout successfully with valid auth', async () => {
      const { user: student } = await createTestStudent({ username: 'teststudent' })

      // First login to get tokens
      const loginRes = await request(app)
        .post('/api/student/auth/login')
        .send({ username: 'teststudent', password: 'testpassword123' })

      const { refreshToken } = loginRes.body.data

      // Logout
      const res = await request(app)
        .post('/api/student/auth/logout')
        .set(getAuthHeader(student))
        .send({ refreshToken })

      expect(res.status).toBe(200)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/student/auth/logout')
        .send({})

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .post('/api/student/auth/logout')
        .set(getAuthHeader(admin))
        .send({})

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/student/auth/me', () => {
    it('should return current student profile with gamification stats', async () => {
      const { user: student, profile } = await createTestStudent({
        username: 'teststudent',
        displayName: 'Test Student',
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        currentLevel: 10,
        totalXp: 1500,
        currencyBalance: 250,
        currentStreakDays: 7,
        preferences: {
          theme: 'dark',
          fontSize: 16,
        },
      })

      const res = await request(app)
        .get('/api/student/auth/me')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.username).toBe('teststudent')
      expect(res.body.data.displayName).toBe('Test Student')
      expect(res.body.data.role).toBe('student')
      expect(res.body.data.currentLevel).toBe(10)
      expect(res.body.data.totalXp).toBe(1500)
      expect(res.body.data.currencyBalance).toBe(250)
      expect(res.body.data.currentStreakDays).toBe(7)
      expect(res.body.data.preferences).toEqual({
        theme: 'dark',
        fontSize: 16,
      })
      // Should not include sensitive tokens
      expect(res.body.data.accessToken).toBeUndefined()
      expect(res.body.data.refreshToken).toBeUndefined()
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/auth/me')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/auth/me')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })
})
