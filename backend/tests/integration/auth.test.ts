import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import { createTestUser, createTestStudent } from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'

describe('Auth API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/auth/login', () => {
    it('should login with email and password', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'admin',
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('accessToken')
      expect(res.body.data).toHaveProperty('refreshToken')
      expect(res.body.data.displayName).toBe('Test User')
    })

    it('should login with username and password', async () => {
      const { user } = await createTestStudent({ username: 'teststudent' })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'teststudent', password: 'testpassword123' })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('accessToken')
    })

    it('should return 401 for invalid credentials', async () => {
      await createTestUser({ email: 'test@example.com', password: 'password123' })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })

      expect(res.status).toBe(401)
    })

    it('should return 422 for missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })

      expect(res.status).toBe(422)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
      })

      const res = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeader(user))

      expect(res.status).toBe(200)
      expect(res.body.data.email).toBe('test@example.com')
      expect(res.body.data.displayName).toBe('Test User')
    })

    it('should return 401 without auth header', async () => {
      const res = await request(app).get('/api/auth/me')

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        password: 'password123',
      })

      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      const { refreshToken } = loginRes.body.data

      // Refresh
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('accessToken')
      expect(res.body.data).toHaveProperty('refreshToken')
    })

    it('should return 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })

      expect(res.status).toBe(401)
    })

    it('should return 422 for missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})

      expect(res.status).toBe(422)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout and invalidate refresh token', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'password123',
      })

      // First login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      const { refreshToken } = loginRes.body.data

      // Logout
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })

      expect(res.status).toBe(200)

      // Try to use the refresh token after logout
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })

      expect(refreshRes.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout-all', () => {
    it('should logout from all devices', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        password: 'password123',
      })

      // Login twice to simulate multiple devices
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      // Logout all
      const res = await request(app)
        .post('/api/auth/logout-all')
        .set(getAuthHeader(user))

      expect(res.status).toBe(200)

      // Both refresh tokens should be invalid
      const refresh1 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: login1.body.data.refreshToken })

      const refresh2 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: login2.body.data.refreshToken })

      expect(refresh1.status).toBe(401)
      expect(refresh2.status).toBe(401)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/logout-all')

      expect(res.status).toBe(401)
    })
  })

  describe('Token validation', () => {
    it('should return 401 for malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer malformed.token.here')

      expect(res.status).toBe(401)
    })

    it('should return 401 for missing Bearer prefix', async () => {
      const user = await createTestUser({ email: 'test@example.com' })
      const { Authorization } = getAuthHeader(user)
      const tokenOnly = Authorization.replace('Bearer ', '')

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', tokenOnly)

      expect(res.status).toBe(401)
    })

    it('should return 401 for empty authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', '')

      expect(res.status).toBe(401)
    })
  })
})
