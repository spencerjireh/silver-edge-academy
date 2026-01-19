import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { z } from 'zod'
import { ApiError } from '../utils/ApiError'

interface ValidationSchemas {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      if (schemas.query) {
        const parsed = await schemas.query.parseAsync(req.query)
        Object.assign(req.query, parsed)
      }
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params)
        Object.assign(req.params, parsed)
      }
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details: Record<string, string> = {}
        for (const err of error.issues) {
          const path = err.path.join('.')
          details[path] = err.message
        }
        next(ApiError.validationError(details))
        return
      }
      next(error)
    }
  }
}

export function validateBody<T extends z.ZodSchema>(schema: T) {
  return validate({ body: schema })
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return validate({ query: schema })
}

export function validateParams<T extends z.ZodSchema>(schema: T) {
  return validate({ params: schema })
}
