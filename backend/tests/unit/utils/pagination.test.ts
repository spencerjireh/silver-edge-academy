import { describe, it, expect } from 'bun:test'
import {
  parsePaginationParams,
  buildPaginationMeta,
  buildSortObject,
} from '../../../src/utils/pagination'

describe('pagination utils', () => {
  describe('parsePaginationParams', () => {
    it('should return default values when no query provided', () => {
      const result = parsePaginationParams({})

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10) // DEFAULT_PAGE_SIZE
      expect(result.skip).toBe(0)
      expect(result.sortBy).toBe('createdAt')
      expect(result.sortOrder).toBe('desc')
    })

    it('should use provided page and limit', () => {
      const result = parsePaginationParams({ page: 3, limit: 20 })

      expect(result.page).toBe(3)
      expect(result.limit).toBe(20)
      expect(result.skip).toBe(40) // (3-1) * 20
    })

    it('should cap limit at MAX_PAGE_SIZE', () => {
      const result = parsePaginationParams({ limit: 200 })

      expect(result.limit).toBe(100) // MAX_PAGE_SIZE
    })

    it('should enforce minimum page of 1', () => {
      const result = parsePaginationParams({ page: 0 })
      expect(result.page).toBe(1)

      const result2 = parsePaginationParams({ page: -5 })
      expect(result2.page).toBe(1)
    })

    it('should use default limit for zero or falsy values', () => {
      // 0 is treated as falsy, so defaults to DEFAULT_PAGE_SIZE (10)
      const result = parsePaginationParams({ limit: 0 })
      expect(result.limit).toBe(10)
    })

    it('should enforce minimum limit of 1 for negative values', () => {
      const result = parsePaginationParams({ limit: -5 })
      expect(result.limit).toBe(1)
    })

    it('should calculate skip correctly', () => {
      const result1 = parsePaginationParams({ page: 1, limit: 10 })
      expect(result1.skip).toBe(0)

      const result2 = parsePaginationParams({ page: 2, limit: 10 })
      expect(result2.skip).toBe(10)

      const result3 = parsePaginationParams({ page: 5, limit: 25 })
      expect(result3.skip).toBe(100)
    })

    it('should use custom sortBy', () => {
      const result = parsePaginationParams({ sortBy: 'name' })

      expect(result.sortBy).toBe('name')
    })

    it('should use custom default sort', () => {
      const result = parsePaginationParams({}, 'updatedAt')

      expect(result.sortBy).toBe('updatedAt')
    })

    it('should handle sortOrder asc', () => {
      const result = parsePaginationParams({ sortOrder: 'asc' })

      expect(result.sortOrder).toBe('asc')
    })

    it('should default to desc for invalid sortOrder', () => {
      const result = parsePaginationParams({ sortOrder: 'invalid' as 'asc' | 'desc' })

      expect(result.sortOrder).toBe('desc')
    })

    it('should handle string page and limit values', () => {
      const result = parsePaginationParams({
        page: '3' as unknown as number,
        limit: '20' as unknown as number,
      })

      expect(result.page).toBe(3)
      expect(result.limit).toBe(20)
    })

    it('should handle NaN values gracefully', () => {
      const result = parsePaginationParams({
        page: 'abc' as unknown as number,
        limit: 'xyz' as unknown as number,
      })

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })

  describe('buildPaginationMeta', () => {
    it('should calculate totalPages correctly', () => {
      const result = buildPaginationMeta(100, 1, 10)

      expect(result.total).toBe(100)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(10)
    })

    it('should round up totalPages', () => {
      const result = buildPaginationMeta(25, 1, 10)

      expect(result.totalPages).toBe(3) // ceil(25/10) = 3
    })

    it('should handle zero total', () => {
      const result = buildPaginationMeta(0, 1, 10)

      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it('should handle total equals limit', () => {
      const result = buildPaginationMeta(10, 1, 10)

      expect(result.totalPages).toBe(1)
    })

    it('should handle single item', () => {
      const result = buildPaginationMeta(1, 1, 10)

      expect(result.totalPages).toBe(1)
    })

    it('should handle large numbers', () => {
      const result = buildPaginationMeta(1000000, 1, 100)

      expect(result.totalPages).toBe(10000)
    })
  })

  describe('buildSortObject', () => {
    it('should return 1 for asc', () => {
      const result = buildSortObject('createdAt', 'asc')

      expect(result).toEqual({ createdAt: 1 })
    })

    it('should return -1 for desc', () => {
      const result = buildSortObject('createdAt', 'desc')

      expect(result).toEqual({ createdAt: -1 })
    })

    it('should use dynamic field name', () => {
      const result = buildSortObject('name', 'asc')

      expect(result).toEqual({ name: 1 })
    })

    it('should handle nested field paths', () => {
      const result = buildSortObject('user.createdAt', 'desc')

      expect(result).toEqual({ 'user.createdAt': -1 })
    })
  })
})
