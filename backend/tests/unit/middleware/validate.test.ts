import { describe, it, expect, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validate, validateBody, validateQuery, validateParams } from '../../../src/middleware/validate'
import { ApiError } from '../../../src/utils/ApiError'

function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    query: {},
    params: {},
    ...overrides,
  }
}

function createMockResponse(): Partial<Response> {
  return {}
}

describe('validate middleware', () => {
  describe('validateBody', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })

    it('should pass validation and replace body with parsed data', async () => {
      const req = createMockRequest({
        body: { name: 'John', email: 'john@example.com' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(schema)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(req.body).toEqual({ name: 'John', email: 'john@example.com' })
    })

    it('should call next with ApiError for invalid data', async () => {
      const req = createMockRequest({
        body: { name: '', email: 'invalid-email' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(schema)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      const errorArg = next.mock.calls[0][0]
      expect(errorArg).toBeInstanceOf(ApiError)
      expect(errorArg.statusCode).toBe(422)
    })

    it('should include field-level error details', async () => {
      const req = createMockRequest({
        body: { name: '', email: 'invalid' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(schema)
      await middleware(req, res, next)

      const errorArg = next.mock.calls[0][0] as ApiError
      expect(errorArg.details).toBeDefined()
      expect(errorArg.details?.name).toBeDefined()
      expect(errorArg.details?.email).toBeDefined()
    })

    it('should handle missing required fields', async () => {
      const req = createMockRequest({
        body: {},
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(schema)
      await middleware(req, res, next)

      const errorArg = next.mock.calls[0][0]
      expect(errorArg).toBeInstanceOf(ApiError)
    })

    it('should transform data according to schema', async () => {
      const transformSchema = z.object({
        count: z.coerce.number(),
      })

      const req = createMockRequest({
        body: { count: '42' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(transformSchema)
      await middleware(req, res, next)

      expect(req.body.count).toBe(42)
      expect(typeof req.body.count).toBe('number')
    })
  })

  describe('validateQuery', () => {
    const schema = z.object({
      page: z.coerce.number().optional(),
      search: z.string().optional(),
    })

    it('should pass validation for valid query params', async () => {
      const req = createMockRequest({
        query: { page: '1', search: 'test' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateQuery(schema)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.query.page).toBe(1)
      expect(req.query.search).toBe('test')
    })

    it('should call next with ApiError for invalid query', async () => {
      const strictSchema = z.object({
        page: z.coerce.number().min(1),
      })

      const req = createMockRequest({
        query: { page: '0' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateQuery(strictSchema)
      await middleware(req, res, next)

      const errorArg = next.mock.calls[0][0]
      expect(errorArg).toBeInstanceOf(ApiError)
    })
  })

  describe('validateParams', () => {
    const schema = z.object({
      id: z.string().regex(/^[0-9a-f]{24}$/),
    })

    it('should pass validation for valid params', async () => {
      const req = createMockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateParams(schema)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.params.id).toBe('507f1f77bcf86cd799439011')
    })

    it('should call next with ApiError for invalid params', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateParams(schema)
      await middleware(req, res, next)

      const errorArg = next.mock.calls[0][0]
      expect(errorArg).toBeInstanceOf(ApiError)
    })
  })

  describe('validate (combined)', () => {
    it('should validate body, query, and params together', async () => {
      const schemas = {
        body: z.object({ name: z.string() }),
        query: z.object({ page: z.coerce.number().optional() }),
        params: z.object({ id: z.string() }),
      }

      const req = createMockRequest({
        body: { name: 'Test' },
        query: { page: '2' },
        params: { id: '123' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validate(schemas)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.body.name).toBe('Test')
      expect(req.query.page).toBe(2)
      expect(req.params.id).toBe('123')
    })

    it('should handle nested object errors with dot notation', async () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      })

      const req = createMockRequest({
        body: { user: { email: 'invalid' } },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(schema)
      await middleware(req, res, next)

      const errorArg = next.mock.calls[0][0] as ApiError
      expect(errorArg.details?.['user.email']).toBeDefined()
    })

    it('should pass through non-Zod errors', async () => {
      const errorSchema = z.object({
        field: z.string().transform(() => {
          throw new Error('Custom error')
        }),
      })

      const req = createMockRequest({
        body: { field: 'test' },
      }) as Request
      const res = createMockResponse() as Response
      const next = mock(() => {})

      const middleware = validateBody(errorSchema)
      await middleware(req, res, next)

      const errorArg = next.mock.calls[0][0]
      expect(errorArg).toBeInstanceOf(Error)
      expect(errorArg.message).toBe('Custom error')
    })
  })
})
