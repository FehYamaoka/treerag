import type { JWTPayload } from './auth.middleware'

export function requireRole(...roles: JWTPayload['role'][]) {
  return (user: JWTPayload | { error: string } | undefined, { set }: { set: { status: number } }) => {
    if (!user || 'error' in user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
    if (!roles.includes(user.role)) {
      set.status = 403
      return { error: 'Forbidden' }
    }
  }
}
