import { describe, test, expect } from 'bun:test'
import jwt from 'jsonwebtoken'
import { verifyAccessToken } from './auth.middleware'

process.env.JWT_SECRET = 'test_secret'

describe('verifyAccessToken', () => {
  test('retorna payload de token válido', () => {
    const token = jwt.sign({ userId: '123', role: 'user' }, 'test_secret', { expiresIn: '15m' })
    const payload = verifyAccessToken(token)
    expect(payload.userId).toBe('123')
  })

  test('lança erro para token inválido', () => {
    expect(() => verifyAccessToken('bad_token')).toThrow()
  })
})
