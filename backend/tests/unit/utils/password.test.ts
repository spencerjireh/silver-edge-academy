import { describe, it, expect } from 'bun:test'
import { hashPassword, comparePassword } from '../../../src/utils/password'

describe('password utils', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      // Bcrypt hashes start with $2b$ or $2a$
      expect(hash).toMatch(/^\$2[ab]\$/)
    })

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1')
      const hash2 = await hashPassword('password2')

      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty string', async () => {
      const hash = await hashPassword('')

      expect(hash).toBeDefined()
      expect(hash).toMatch(/^\$2[ab]\$/)
    })

    it('should handle special characters', async () => {
      const password = 'p@$$w0rd!#$%^&*()'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).toMatch(/^\$2[ab]\$/)
    })
  })

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const result = await comparePassword(password, hash)

      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const result = await comparePassword('wrongPassword', hash)

      expect(result).toBe(false)
    })

    it('should return false for empty password against valid hash', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const result = await comparePassword('', hash)

      expect(result).toBe(false)
    })

    it('should return true for empty password when hash was empty', async () => {
      const hash = await hashPassword('')

      const result = await comparePassword('', hash)

      expect(result).toBe(true)
    })

    it('should handle special characters in comparison', async () => {
      const password = 'p@$$w0rd!#$%^&*()'
      const hash = await hashPassword(password)

      const result = await comparePassword(password, hash)

      expect(result).toBe(true)
    })
  })
})
