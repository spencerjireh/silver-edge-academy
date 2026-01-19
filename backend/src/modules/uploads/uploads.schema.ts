import { z } from 'zod'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from '@silveredge/shared'

export const uploadQuerySchema = z.object({
  folder: z.string().optional(),
})

export const deleteParamSchema = z.object({
  key: z.string().min(1),
})

export type UploadQuery = z.infer<typeof uploadQuerySchema>

export const allowedMimeTypes = ALLOWED_FILE_TYPES as readonly string[]
export const maxFileSizeMB = MAX_FILE_SIZE_MB
