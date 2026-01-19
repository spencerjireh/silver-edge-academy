import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import mongoose from 'mongoose'

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ApiError - our custom errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json(error.toJSON())
    return
  }

  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.entries(error.errors).reduce(
      (acc, [key, err]) => {
        acc[key] = err.message
        return acc
      },
      {} as Record<string, string>
    )
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    })
    return
  }

  // Mongoose cast error (invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: `Invalid ${error.path}: ${error.value}`,
      },
    })
    return
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoServerError' && (error as unknown as { code: number }).code === 11000) {
    const keyValue = (error as unknown as { keyValue: Record<string, unknown> }).keyValue
    const field = Object.keys(keyValue)[0]
    res.status(409).json({
      error: {
        code: 'DUPLICATE_KEY',
        message: `${field} already exists`,
        details: { field },
      },
    })
    return
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
    })
    return
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      },
    })
    return
  }

  // Unknown errors
  logger.error({ error, stack: error.stack }, 'Unhandled error')

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    },
  })
}
