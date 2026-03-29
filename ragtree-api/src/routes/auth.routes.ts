import { Elysia, t } from 'elysia'
import bcrypt from 'bcrypt'
import { User } from '../models/user.model'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middleware/auth.middleware'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set, cookie }) => {
    const { name, email, password } = body
    const existing = await User.findOne({ email })
    if (existing) { set.status = 409; return { error: 'Email já cadastrado' } }
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed, role: 'user' })
    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    set.status = 201
    return { access_token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
  }, {
    body: t.Object({ name: t.String({ minLength: 2 }), email: t.String({ format: 'email' }), password: t.String({ minLength: 8 }) })
  })

  .post('/login', async ({ body, set, cookie }) => {
    const { email, password } = body
    const user = await User.findOne({ email })
    if (!user || !user.password) { set.status = 401; return { error: 'Credenciais inválidas' } }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) { set.status = 401; return { error: 'Credenciais inválidas' } }
    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    return { access_token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
  }, {
    body: t.Object({ email: t.String({ format: 'email' }), password: t.String() })
  })

  .post('/refresh', async ({ cookie, set }) => {
    const token = cookie.refresh_token.value
    if (!token) { set.status = 401; return { error: 'No refresh token' } }
    try {
      const payload = verifyRefreshToken(token)
      const access_token = signAccessToken({ userId: payload.userId, role: payload.role })
      return { access_token }
    } catch {
      set.status = 401
      return { error: 'Invalid refresh token' }
    }
  })

  .post('/logout', ({ cookie }) => {
    cookie.refresh_token.remove()
    return { message: 'Logged out' }
  })
