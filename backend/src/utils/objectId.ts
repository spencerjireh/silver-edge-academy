import { Types } from 'mongoose'
import { ApiError } from './ApiError'

/**
 * Validates and converts a string to a MongoDB ObjectId.
 * Throws ApiError.badRequest if the string is not a valid ObjectId.
 */
export function toObjectId(id: string, fieldName = 'id'): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest(`Invalid ${fieldName}: must be a valid ObjectId`)
  }
  return new Types.ObjectId(id)
}

/**
 * Validates and converts an array of strings to MongoDB ObjectIds.
 * Throws ApiError.badRequest if any string is not a valid ObjectId.
 */
export function toObjectIds(ids: string[], fieldName = 'ids'): Types.ObjectId[] {
  return ids.map((id, index) => {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid ${fieldName}[${index}]: must be a valid ObjectId`)
    }
    return new Types.ObjectId(id)
  })
}

/**
 * Type guard to check if a value is a valid ObjectId string.
 */
export function isValidObjectId(id: unknown): id is string {
  return typeof id === 'string' && Types.ObjectId.isValid(id)
}

/**
 * Safely converts a string to ObjectId, returning null if invalid.
 * Useful for optional ID fields that might be undefined or invalid.
 */
export function toObjectIdOrNull(id: string | undefined | null): Types.ObjectId | null {
  if (!id || !Types.ObjectId.isValid(id)) {
    return null
  }
  return new Types.ObjectId(id)
}
