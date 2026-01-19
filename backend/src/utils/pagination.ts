import type { PaginationMeta, PaginationParams } from '@silveredge/shared'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@silveredge/shared'

export interface ParsedPagination {
  page: number
  limit: number
  skip: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function parsePaginationParams(
  query: PaginationParams,
  defaultSort = 'createdAt'
): ParsedPagination {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE))
  const skip = (page - 1) * limit
  const sortBy = query.sortBy || defaultSort
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

  return { page, limit, skip, sortBy, sortOrder }
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export function buildSortObject(sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, 1 | -1> {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
}
