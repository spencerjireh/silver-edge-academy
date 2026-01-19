import { describe, it, expect, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'
import { authenticate, optionalAuth, type AuthenticatedRequest } from '../../../src/middleware/auth'
import { generateAccessToken } from '../../../src/utils/tokens'
import { ApiError } from '../../../src/utils/ApiError'

function createMockRequest(headers: Record<string, string> = {}): Partial<Request> {
  return {
    headers,
  }
}

function createMockResponse(): Partial<Response> {
  return {}
}

describe('auth middleware', () => {
  describe('authenticate', () => {
    it('should call next with user attached for valid token', () => {
      const token = generateAccessToken({ userId: 'user123', role: 'student' })
      const req = createMockRequest({ authorization: `Bearer ${token}` }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect((req as AuthenticatedRequest).user).toBeDefined()
      expect((req as AuthenticatedRequest).user.userId).toBe('user123')
      expect((req as AuthenticatedRequest).user.role).toBe('student')
    })

    it('should call next with error for missing authorization header', () => {
      const req = createMockRequest({}) as Request
      const res = createMockResponse() as Response
      let capturedError: unknown
      const next = mock((err?: unknown) => { capturedError = err })

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(capturedError).toBeInstanceOf(ApiError)
      expect((capturedError as ApiError).message).toBe('Missing or invalid authorization header')
    })

    it('should call next with error for missing Bearer prefix', () => {
      const token = generateAccessToken({ userId: 'user123', role: 'student' })
      const req = createMockRequest({ authorization: token }) as Request
      const res = createMockResponse() as Response
      let capturedError: unknown
      const next = mock((err?: unknown) => { capturedError = err })

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(capturedError).toBeInstanceOf(ApiError)
      expect((capturedError as ApiError).message).toBe('Missing or invalid authorization header')
    })

    it('should call next with error for empty authorization header', () => {
      const req = createMockRequest({ authorization: '' }) as Request
      const res = createMockResponse() as Response
      let capturedError: unknown
      const next = mock((err?: unknown) => { capturedError = err })

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(capturedError).toBeInstanceOf(ApiError)
    })

    it('should call next with error for invalid token', () => {
      const req = createMockRequest({ authorization: 'Bearer invalid.token.here' }) as Request
      const res = createMockResponse() as Response
      let capturedError: unknown
      const next = mock((err?: unknown) => { capturedError = err })

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(capturedError).toBeInstanceOf(ApiError)
      expect((capturedError as ApiError).message).toBe('Invalid or expired token')
    })

    it('should call next with error for malformed token', () => {
      const req = createMockRequest({ authorization: 'Bearer not-a-jwt' }) as Request
      const res = createMockResponse() as Response
      let capturedError: unknown
      const next = mock((err?: unknown) => { capturedError = err })

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(capturedError).toBeInstanceOf(ApiError)
    })

    it('should call next with error for Bearer with only spaces', () => {
      const req = createMockRequest({ authorization: 'Bearer    ' }) as Request
      const res = createMockResponse() as Response
      let capturedError: unknown
      const next = mock((err?: unknown) => { capturedError = err })

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(capturedError).toBeInstanceOf(ApiError)
    })
  })

  describe('optionalAuth', () => {
    it('should attach user for valid token', () => {
      const token = generateAccessToken({ userId: 'user123', role: 'admin' })
      const req = createMockRequest({ authorization: `Bearer ${token}` }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      optionalAuth(req, res, next)

      expect(next).toHaveBeenCalled()
      expect((req as AuthenticatedRequest).user).toBeDefined()
      expect((req as AuthenticatedRequest).user.userId).toBe('user123')
      expect((req as AuthenticatedRequest).user.role).toBe('admin')
    })

    it('should call next without user for missing header', () => {
      const req = createMockRequest({}) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      optionalAuth(req, res, next)

      expect(next).toHaveBeenCalled()
      expect((req as AuthenticatedRequest).user).toBeUndefined()
    })

    it('should call next without user for invalid token', () => {
      const req = createMockRequest({ authorization: 'Bearer invalid.token' }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      optionalAuth(req, res, next)

      expect(next).toHaveBeenCalled()
      expect((req as AuthenticatedRequest).user).toBeUndefined()
    })

    it('should call next without user for missing Bearer prefix', () => {
      const token = generateAccessToken({ userId: 'user123', role: 'student' })
      const req = createMockRequest({ authorization: token }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      optionalAuth(req, res, next)

      expect(next).toHaveBeenCalled()
      expect((req as AuthenticatedRequest).user).toBeUndefined()
    })
  })
})
