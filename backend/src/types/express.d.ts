import type { Request } from 'express'
import type { UserRole } from '@silveredge/shared'
import type { ParamsDictionary } from 'express-serve-static-core'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: UserRole
      }
    }
  }
}

/**
 * Typed request interface for controllers with validated body, query, and params.
 * Use with Zod-validated request data to preserve type safety.
 *
 * @example
 * export const list = asyncHandler(async (
 *   req: ValidatedRequest<unknown, ListUsersQuery>,
 *   res: Response
 * ) => {
 *   const { role, status } = req.query // TypeScript knows the shape
 * })
 */
export interface ValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams extends ParamsDictionary = ParamsDictionary
> extends Request<TParams, unknown, TBody, TQuery> {
  body: TBody
  query: TQuery
  params: TParams
  user?: {
    userId: string
    role: UserRole
  }
}

/**
 * Authenticated request with validated data.
 * Use when authentication is required.
 */
export interface AuthenticatedValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams extends ParamsDictionary = ParamsDictionary
> extends ValidatedRequest<TBody, TQuery, TParams> {
  user: {
    userId: string
    role: UserRole
  }
}

export {}
