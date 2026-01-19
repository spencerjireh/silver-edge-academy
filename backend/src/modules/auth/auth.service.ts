import { Types } from 'mongoose'
import { User, type IUser } from '../users/users.model'
import { StudentProfile } from '../users/studentProfile.model'
import { TeacherProfile } from '../users/teacherProfile.model'
import { ParentProfile } from '../users/parentProfile.model'
import { RefreshToken } from './refreshToken.model'
import { ApiError } from '../../utils/ApiError'
import { comparePassword } from '../../utils/password'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getTokenExpiry,
} from '../../utils/tokens'
import { config } from '../../config'
import type { LoginInput } from './auth.schema'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserWithProfile {
  user: IUser
  profile?: {
    currentLevel?: number
    totalXp?: number
    currencyBalance?: number
    classId?: string
    classIds?: string[]
    childIds?: string[]
  }
}

async function getUserWithProfile(user: IUser): Promise<UserWithProfile> {
  const result: UserWithProfile = { user }

  if (user.role === 'student') {
    const profile = await StudentProfile.findOne({ userId: user._id })
    if (profile) {
      result.profile = {
        currentLevel: profile.currentLevel,
        totalXp: profile.totalXp,
        currencyBalance: profile.currencyBalance,
        classId: profile.classId?.toString(),
      }
    }
  } else if (user.role === 'teacher') {
    const profile = await TeacherProfile.findOne({ userId: user._id })
    if (profile) {
      result.profile = {
        classIds: profile.classIds.map((id) => id.toString()),
      }
    }
  } else if (user.role === 'parent') {
    const profile = await ParentProfile.findOne({ userId: user._id })
    if (profile) {
      result.profile = {
        childIds: profile.childIds.map((id) => id.toString()),
      }
    }
  }

  return result
}

export async function login(
  input: LoginInput
): Promise<{ user: UserWithProfile; tokens: AuthTokens }> {
  const { email, username, password } = input

  // Find user by email or username
  const query = email ? { email: email.toLowerCase() } : { username: username?.toLowerCase() }
  const user = await User.findOne(query)

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials')
  }

  if (user.status !== 'active') {
    throw ApiError.unauthorized('Account is inactive')
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid credentials')
  }

  // Update last login
  user.lastLoginAt = new Date()
  await user.save()

  // Generate tokens
  const tokenPayload = { userId: user._id.toString(), role: user.role }
  const accessToken = generateAccessToken(tokenPayload)
  const refreshToken = generateRefreshToken(tokenPayload)

  // Store refresh token
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: getTokenExpiry(config.jwt.refreshExpiresIn),
  })

  const userWithProfile = await getUserWithProfile(user)

  return {
    user: userWithProfile,
    tokens: { accessToken, refreshToken },
  }
}

export async function refresh(
  refreshTokenValue: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // Verify token
  let decoded
  try {
    decoded = verifyToken(refreshTokenValue)
  } catch {
    throw ApiError.unauthorized('Invalid refresh token')
  }

  // Find and validate stored token
  const storedToken = await RefreshToken.findOne({ token: refreshTokenValue })
  if (!storedToken) {
    throw ApiError.unauthorized('Refresh token not found or already used')
  }

  // Delete old token
  await RefreshToken.deleteOne({ _id: storedToken._id })

  // Generate new tokens
  const tokenPayload = { userId: decoded.userId, role: decoded.role }
  const newAccessToken = generateAccessToken(tokenPayload)
  const newRefreshToken = generateRefreshToken(tokenPayload)

  // Store new refresh token
  await RefreshToken.create({
    userId: decoded.userId,
    token: newRefreshToken,
    expiresAt: getTokenExpiry(config.jwt.refreshExpiresIn),
  })

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await RefreshToken.deleteOne({ token: refreshTokenValue })
}

export async function logoutAll(userId: string): Promise<void> {
  await RefreshToken.deleteMany({ userId: new Types.ObjectId(userId) })
}

export async function getCurrentUser(userId: string): Promise<UserWithProfile> {
  const user = await User.findById(userId)
  if (!user) {
    throw ApiError.notFound('User')
  }

  return getUserWithProfile(user)
}
