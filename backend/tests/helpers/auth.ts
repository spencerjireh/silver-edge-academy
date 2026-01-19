import { generateAccessToken } from '../../src/utils/tokens'
import type { IUser } from '../../src/modules/users/users.model'

export function getAuthHeader(user: IUser): { Authorization: string } {
  const token = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  })
  return { Authorization: `Bearer ${token}` }
}

export function getAuthToken(user: IUser): string {
  return generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  })
}
