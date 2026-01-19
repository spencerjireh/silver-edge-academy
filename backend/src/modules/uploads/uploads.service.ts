import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../../config'
import { v4 as uuidv4 } from 'uuid'
import { ApiError } from '../../utils/ApiError'
import { allowedMimeTypes, maxFileSizeMB } from './uploads.schema'

const s3Client = config.s3.endpoint
  ? new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      credentials:
        config.s3.accessKey && config.s3.secretKey
          ? {
              accessKeyId: config.s3.accessKey,
              secretAccessKey: config.s3.secretKey,
            }
          : undefined,
      forcePathStyle: true,
    })
  : null

export interface UploadResult {
  key: string
  url: string
  size: number
  mimeType: string
}

export async function uploadFile(
  file: Express.Multer.File,
  folder?: string
): Promise<UploadResult> {
  if (!s3Client) {
    throw ApiError.internal('File storage is not configured')
  }

  // Validate file type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw ApiError.badRequest(`File type ${file.mimetype} is not allowed`)
  }

  // Validate file size
  if (file.size > maxFileSizeMB * 1024 * 1024) {
    throw ApiError.badRequest(`File size exceeds ${maxFileSizeMB}MB limit`)
  }

  // Generate unique key
  const extension = file.originalname.split('.').pop() || ''
  const key = folder
    ? `${folder}/${uuidv4()}.${extension}`
    : `${uuidv4()}.${extension}`

  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  )

  // Generate URL
  const url = config.s3.endpoint
    ? `${config.s3.endpoint}/${config.s3.bucket}/${key}`
    : `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`

  return {
    key,
    url,
    size: file.size,
    mimeType: file.mimetype,
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (!s3Client) {
    throw ApiError.internal('File storage is not configured')
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    })
  )
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (!s3Client) {
    throw ApiError.internal('File storage is not configured')
  }

  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}
