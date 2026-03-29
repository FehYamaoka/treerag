import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { authRoutes } from './auth.routes'

const app = new Elysia().use(authRoutes)
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/ragtree_test_auth'

beforeAll(async () => {
  process.env.JWT_SECRET = 'test'
  process.env.JWT_REFRESH_SECRET = 'test_refresh'
  await mongoose.connect(TEST_MONGODB_URI)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('POST /auth/register', () => {
  test('registra usuário com sucesso', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'Test@1234' })
      })
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.access_token).toBeDefined()
  })

  test('rejeita email duplicado', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test2', email: 'test@test.com', password: 'Test@1234' })
      })
    )
    expect(res.status).toBe(409)
  })
})

describe('POST /auth/login', () => {
  test('login com credenciais corretas', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'Test@1234' })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.access_token).toBeDefined()
  })

  test('rejeita senha errada', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      })
    )
    expect(res.status).toBe(401)
  })
})
