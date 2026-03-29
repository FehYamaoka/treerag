import jwt from 'jsonwebtoken'
import type { Context } from 'elysia'

export interface JWTPayload extends Record<string, unknown> {
  userId: string
  role: 'user' | 'collaborator' | 'admin'
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' })
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload
}

export const authMiddleware = ({ headers, set }: Context) => {
  const auth = headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized' }
  }
  try {
    return verifyAccessToken(auth.slice(7))
  } catch {
    set.status = 401
    return { error: 'Invalid token' }
  }
}
