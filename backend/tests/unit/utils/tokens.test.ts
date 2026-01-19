import { describe, it, expect } from 'bun:test'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  getTokenExpiry,
} from '../../../src/utils/tokens'

describe('token utils', () => {
  const testPayload = {
    userId: '507f1f77bcf86cd799439011',
    role: 'student',
  }

  describe('generateAccessToken', () => {
    it('should return a valid JWT string', () => {
      const token = generateAccessToken(testPayload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      // JWT has 3 parts separated by dots
      expect(token.split('.').length).toBe(3)
    })

    it('should include payload data in token', () => {
      const token = generateAccessToken(testPayload)
      const decoded = decodeToken(token)

      expect(decoded?.userId).toBe(testPayload.userId)
      expect(decoded?.role).toBe(testPayload.role)
    })

    it('should include iat and exp claims', () => {
      const token = generateAccessToken(testPayload)
      const decoded = decodeToken(token)

      expect(decoded?.iat).toBeDefined()
      expect(decoded?.exp).toBeDefined()
      expect(decoded!.exp).toBeGreaterThan(decoded!.iat)
    })
  })

  describe('generateRefreshToken', () => {
    it('should return a valid JWT string', () => {
      const token = generateRefreshToken(testPayload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('should include payload data in token', () => {
      const token = generateRefreshToken(testPayload)
      const decoded = decodeToken(token)

      expect(decoded?.userId).toBe(testPayload.userId)
      expect(decoded?.role).toBe(testPayload.role)
    })

    it('should have longer expiry than access token', () => {
      const accessToken = generateAccessToken(testPayload)
      const refreshToken = generateRefreshToken(testPayload)

      const accessDecoded = decodeToken(accessToken)
      const refreshDecoded = decodeToken(refreshToken)

      expect(refreshDecoded!.exp).toBeGreaterThan(accessDecoded!.exp)
    })
  })

  describe('verifyToken', () => {
    it('should return decoded payload for valid token', () => {
      const token = generateAccessToken(testPayload)
      const decoded = verifyToken(token)

      expect(decoded.userId).toBe(testPayload.userId)
      expect(decoded.role).toBe(testPayload.role)
      expect(decoded.iat).toBeDefined()
      expect(decoded.exp).toBeDefined()
    })

    it('should throw for invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow()
    })

    it('should throw for tampered token', () => {
      const token = generateAccessToken(testPayload)
      const tamperedToken = token.slice(0, -5) + 'xxxxx'

      expect(() => verifyToken(tamperedToken)).toThrow()
    })

    it('should throw for empty token', () => {
      expect(() => verifyToken('')).toThrow()
    })
  })

  describe('decodeToken', () => {
    it('should return decoded payload without verification', () => {
      const token = generateAccessToken(testPayload)
      const decoded = decodeToken(token)

      expect(decoded?.userId).toBe(testPayload.userId)
      expect(decoded?.role).toBe(testPayload.role)
    })

    it('should return null for completely invalid token', () => {
      const result = decodeToken('not-a-jwt')

      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = decodeToken('')

      expect(result).toBeNull()
    })

    it('should decode tampered token (does not verify signature)', () => {
      const token = generateAccessToken(testPayload)
      // Tamper with signature but keep payload valid
      const parts = token.split('.')
      parts[2] = 'tamperedsignature'
      const tamperedToken = parts.join('.')

      const decoded = decodeToken(tamperedToken)

      // Should still decode the payload
      expect(decoded?.userId).toBe(testPayload.userId)
    })
  })

  describe('getTokenExpiry', () => {
    it('should parse seconds format', () => {
      const before = new Date()
      const expiry = getTokenExpiry('30s')
      const after = new Date()

      // Expiry should be approximately 30 seconds from now
      const expectedMin = before.getTime() + 30 * 1000
      const expectedMax = after.getTime() + 30 * 1000

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin - 100)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax + 100)
    })

    it('should parse minutes format', () => {
      const before = new Date()
      const expiry = getTokenExpiry('15m')

      const expectedMs = before.getTime() + 15 * 60 * 1000

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMs - 100)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMs + 100)
    })

    it('should parse hours format', () => {
      const before = new Date()
      const expiry = getTokenExpiry('2h')

      const expectedMs = before.getTime() + 2 * 60 * 60 * 1000

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMs - 100)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMs + 100)
    })

    it('should parse days format', () => {
      const before = new Date()
      const expiry = getTokenExpiry('7d')

      const expectedMs = before.getTime() + 7 * 24 * 60 * 60 * 1000

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMs - 100)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMs + 100)
    })

    it('should throw for invalid format', () => {
      expect(() => getTokenExpiry('15x')).toThrow('Invalid expiresIn format')
      expect(() => getTokenExpiry('abc')).toThrow('Invalid expiresIn format')
      expect(() => getTokenExpiry('')).toThrow('Invalid expiresIn format')
      expect(() => getTokenExpiry('15')).toThrow('Invalid expiresIn format')
    })

    it('should handle single digit values', () => {
      const before = new Date()
      const expiry = getTokenExpiry('1m')

      const expectedMs = before.getTime() + 1 * 60 * 1000

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMs - 100)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMs + 100)
    })

    it('should handle large values', () => {
      const before = new Date()
      const expiry = getTokenExpiry('365d')

      const expectedMs = before.getTime() + 365 * 24 * 60 * 60 * 1000

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMs - 100)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMs + 100)
    })
  })
})
