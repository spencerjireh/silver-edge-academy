import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  MONGODB_URI: z.string().default('mongodb://localhost:27017/silveredge'),

  JWT_SECRET: z.string().min(32).default('default-jwt-secret-change-in-production'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('silveredge'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = {
  port: parsed.data.PORT,
  env: parsed.data.NODE_ENV,
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',

  db: {
    uri: parsed.data.MONGODB_URI,
  },

  jwt: {
    secret: parsed.data.JWT_SECRET,
    accessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },

  s3: {
    endpoint: parsed.data.S3_ENDPOINT,
    region: parsed.data.S3_REGION,
    bucket: parsed.data.S3_BUCKET,
    accessKey: parsed.data.S3_ACCESS_KEY,
    secretKey: parsed.data.S3_SECRET_KEY,
  },

  log: {
    level: parsed.data.LOG_LEVEL,
  },
}

export type Config = typeof config
