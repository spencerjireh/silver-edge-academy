import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup'
import { createTestStudent, createTestAdmin, createTestClass } from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'

describe('Student Profile API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/profile', () => {
    it('should return full student profile', async () => {
      const { user: student, profile } = await createTestStudent({
        username: 'teststudent',
        displayName: 'Test Student',
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        currentLevel: 8,
        totalXp: 1200,
        currencyBalance: 300,
        currentStreakDays: 5,
        preferences: {
          theme: 'dark',
          editorTheme: 'monokai',
          fontSize: 14,
        },
      })

      const res = await request(app)
        .get('/api/student/profile')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.username).toBe('teststudent')
      expect(res.body.data.displayName).toBe('Test Student')
      expect(res.body.data.currentLevel).toBe(8)
      expect(res.body.data.totalXp).toBe(1200)
      expect(res.body.data.currencyBalance).toBe(300)
      expect(res.body.data.currentStreakDays).toBe(5)
      expect(res.body.data.preferences).toEqual({
        theme: 'dark',
        editorTheme: 'monokai',
        fontSize: 14,
      })
    })

    it('should include class info when student is in a class', async () => {
      const { user: student, profile } = await createTestStudent()

      const testClass = await createTestClass(undefined, {
        name: 'My Class',
        studentIds: [student._id],
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        classId: testClass._id,
      })

      const res = await request(app)
        .get('/api/student/profile')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.classId).toBe(testClass._id.toString())
      expect(res.body.data.className).toBe('My Class')
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/profile')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/profile')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })

  describe('PATCH /api/student/profile', () => {
    it('should update displayName', async () => {
      const { user: student } = await createTestStudent({
        displayName: 'Original Name',
      })

      const res = await request(app)
        .patch('/api/student/profile')
        .set(getAuthHeader(student))
        .send({ displayName: 'New Name' })

      expect(res.status).toBe(200)
      expect(res.body.data.displayName).toBe('New Name')
    })

    it('should update preferences', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .patch('/api/student/profile')
        .set(getAuthHeader(student))
        .send({
          preferences: {
            theme: 'light',
            editorTheme: 'github',
            fontSize: 18,
          },
        })

      expect(res.status).toBe(200)
      expect(res.body.data.preferences).toEqual({
        theme: 'light',
        editorTheme: 'github',
        fontSize: 18,
      })
    })

    it('should update avatarId', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .patch('/api/student/profile')
        .set(getAuthHeader(student))
        .send({ avatarId: 'avatar-123' })

      expect(res.status).toBe(200)
      expect(res.body.data.avatarId).toBe('avatar-123')
    })

    it('should allow partial updates', async () => {
      const { user: student, profile } = await createTestStudent({
        displayName: 'Original Name',
      })

      await StudentProfile.findByIdAndUpdate(profile._id, {
        preferences: {
          theme: 'dark',
          fontSize: 14,
        },
      })

      // Only update displayName, keep preferences
      const res = await request(app)
        .patch('/api/student/profile')
        .set(getAuthHeader(student))
        .send({ displayName: 'Updated Name' })

      expect(res.status).toBe(200)
      expect(res.body.data.displayName).toBe('Updated Name')
    })

    it('should allow updating only preferences', async () => {
      const { user: student } = await createTestStudent({
        displayName: 'Keep This Name',
      })

      const res = await request(app)
        .patch('/api/student/profile')
        .set(getAuthHeader(student))
        .send({
          preferences: {
            theme: 'system',
          },
        })

      expect(res.status).toBe(200)
      expect(res.body.data.displayName).toBe('Keep This Name')
      expect(res.body.data.preferences.theme).toBe('system')
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/student/profile')
        .send({ displayName: 'New Name' })

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .patch('/api/student/profile')
        .set(getAuthHeader(admin))
        .send({ displayName: 'New Name' })

      expect(res.status).toBe(403)
    })
  })
})
