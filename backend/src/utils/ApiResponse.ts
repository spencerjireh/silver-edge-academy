import type { Response } from 'express'
import type { PaginationMeta } from '@silveredge/shared'

export interface ApiResponseData<T> {
  data: T
  meta?: PaginationMeta
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ data })
}

export function sendPaginated<T>(res: Response, data: T[], meta: PaginationMeta): void {
  res.status(200).json({ data, meta })
}

export function sendCreated<T>(res: Response, data: T): void {
  res.status(201).json({ data })
}

export function sendNoContent(res: Response): void {
  res.status(204).send()
}
