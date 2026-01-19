import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { config } from '../config'

export interface TokenPayload {
  userId: string
  role: string
}

export interface DecodedToken extends TokenPayload {
  iat: number
  exp: number
  jti?: string
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  }
  return jwt.sign(payload, config.jwt.secret, options)
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    jwtid: randomUUID(),
  }
  return jwt.sign(payload, config.jwt.secret, options)
}

export function verifyToken(token: string): DecodedToken {
  return jwt.verify(token, config.jwt.secret) as DecodedToken
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken
  } catch {
    return null
  }
}

export function getTokenExpiry(expiresIn: string): Date {
  const now = new Date()
  const match = expiresIn.match(/^(\d+)([smhd])$/)

  if (!match) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`)
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's':
      now.setSeconds(now.getSeconds() + value)
      break
    case 'm':
      now.setMinutes(now.getMinutes() + value)
      break
    case 'h':
      now.setHours(now.getHours() + value)
      break
    case 'd':
      now.setDate(now.getDate() + value)
      break
  }

  return now
}
