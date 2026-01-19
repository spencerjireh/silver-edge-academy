import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import type { AuthenticatedRequest } from './auth'
import type { UserRole } from '@silveredge/shared'

export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.user) {
      return next(ApiError.unauthorized())
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'))
    }

    next()
  }
}

export function authorizeOwnerOrRoles(
  allowedRoles: UserRole[],
  getOwnerId: (req: Request) => string | undefined
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.user) {
      return next(ApiError.unauthorized())
    }

    const ownerId = getOwnerId(req)
    const isOwner = ownerId && ownerId === authReq.user.userId
    const hasRole = allowedRoles.includes(authReq.user.role)

    if (!isOwner && !hasRole) {
      return next(ApiError.forbidden('You do not have permission to access this resource'))
    }

    next()
  }
}
