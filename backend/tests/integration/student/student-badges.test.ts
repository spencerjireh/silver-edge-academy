import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestBadge,
  createTestStudentBadge,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'

describe('Student Badges API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/badges', () => {
    it('should return all badges with earned status', async () => {
      const { user: student } = await createTestStudent()

      const badge1 = await createTestBadge({ name: 'First Login', triggerType: 'first_login' })
      const badge2 = await createTestBadge({ name: 'First Lesson', triggerType: 'first_lesson' })
      const badge3 = await createTestBadge({ name: 'First Exercise', triggerType: 'first_exercise' })

      // Earn only badge1
      await createTestStudentBadge(student._id, badge1._id)

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(3)

      const earnedBadge = res.body.data.find((b: { name: string }) => b.name === 'First Login')
      const unearnedBadge = res.body.data.find((b: { name: string }) => b.name === 'First Lesson')

      expect(earnedBadge.isEarned).toBe(true)
      expect(unearnedBadge.isEarned).toBe(false)
    })

    it('should include earnedAt for earned badges', async () => {
      const { user: student } = await createTestStudent()

      const badge = await createTestBadge({ name: 'Test Badge' })
      const earnedDate = new Date('2024-06-15T10:30:00.000Z')
      await createTestStudentBadge(student._id, badge._id, { earnedAt: earnedDate })

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      const earnedBadge = res.body.data.find((b: { name: string }) => b.name === 'Test Badge')
      expect(earnedBadge.isEarned).toBe(true)
      expect(earnedBadge.earnedAt).toBeDefined()
      expect(new Date(earnedBadge.earnedAt).toISOString()).toBe(earnedDate.toISOString())
    })

    it('should not include earnedAt for unearned badges', async () => {
      const { user: student } = await createTestStudent()

      await createTestBadge({ name: 'Unearned Badge' })

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      const unearnedBadge = res.body.data.find((b: { name: string }) => b.name === 'Unearned Badge')
      expect(unearnedBadge.isEarned).toBe(false)
      expect(unearnedBadge.earnedAt).toBeUndefined()
    })

    it('should only return active badges', async () => {
      const { user: student } = await createTestStudent()

      await createTestBadge({ name: 'Active Badge', isActive: true })
      await createTestBadge({ name: 'Inactive Badge', isActive: false })

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].name).toBe('Active Badge')
    })

    it('should include badge details', async () => {
      const { user: student } = await createTestStudent()

      await createTestBadge({
        name: 'XP Master',
        description: 'Earn 1000 XP',
        iconName: 'star',
        triggerType: 'xp_earned',
        triggerValue: 1000,
      })

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      const badge = res.body.data[0]
      expect(badge.name).toBe('XP Master')
      expect(badge.description).toBe('Earn 1000 XP')
      expect(badge.iconName).toBe('star')
      expect(badge.triggerType).toBe('xp_earned')
      expect(badge.triggerValue).toBe(1000)
      expect(badge.gradientFrom).toBeDefined()
      expect(badge.gradientTo).toBeDefined()
    })

    it('should sort badges by triggerValue', async () => {
      const { user: student } = await createTestStudent()

      await createTestBadge({ name: 'Badge C', triggerType: 'xp_earned', triggerValue: 500 })
      await createTestBadge({ name: 'Badge A', triggerType: 'xp_earned', triggerValue: 100 })
      await createTestBadge({ name: 'Badge B', triggerType: 'xp_earned', triggerValue: 250 })

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data[0].name).toBe('Badge A')
      expect(res.body.data[1].name).toBe('Badge B')
      expect(res.body.data[2].name).toBe('Badge C')
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/badges')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/badges')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })
})
