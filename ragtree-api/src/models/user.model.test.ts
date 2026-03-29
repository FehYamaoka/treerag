import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import mongoose from 'mongoose'
import { User } from './user.model'

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/ragtree_test'

beforeAll(async () => {
  await mongoose.connect(TEST_MONGODB_URI)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('User model', () => {
  test('creates user with valid fields', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'create-test@test.com',
      password: 'hashed',
      role: 'user'
    })
    expect(user._id).toBeDefined()
    expect(user.role).toBe('user')
  })

  test('rejects duplicate email', async () => {
    await User.create({ name: 'First', email: 'dup@test.com', password: 'hashed', role: 'user' })
    await expect(User.create({
      name: 'Second',
      email: 'dup@test.com',
      password: 'hashed',
      role: 'user'
    })).rejects.toThrow()
  })
})
