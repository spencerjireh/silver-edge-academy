import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { verifyToken } from '../utils/tokens'
import type { UserRole } from '@silveredge/shared'

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string
    role: UserRole
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid authorization header'))
  }

  const token = authHeader.substring(7)

  try {
    const decoded = verifyToken(token)
    ;(req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      role: decoded.role as UserRole,
    }
    next()
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'))
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.substring(7)

  try {
    const decoded = verifyToken(token)
    ;(req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      role: decoded.role as UserRole,
    }
  } catch {
    // Token invalid, continue without auth
  }

  next()
}
