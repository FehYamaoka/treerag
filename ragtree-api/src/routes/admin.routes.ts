import { Elysia, t } from 'elysia'
import { User } from '../models/user.model'
import { Item } from '../models/item.model'
import { Monster } from '../models/monster.model'
import { Skill } from '../models/skill.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .derive(authMiddleware)
  .onBeforeHandle(({ userId, role, set }: any) => {
    if (!userId || role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
  })

  .get('/users', async ({ query }) => {
    const { page = '1', limit = '50' } = query
    const skip = (Number(page) - 1) * Number(limit)
    return User.find({}, '-password').skip(skip).limit(Number(limit)).lean()
  })

  .put('/users/:id/role', async ({ params, body }) => {
    return User.findByIdAndUpdate(params.id, { role: body.role }, { new: true, select: '-password' })
  }, {
    body: t.Object({
      role: t.Union([t.Literal('user'), t.Literal('collaborator'), t.Literal('admin')])
    })
  })

  .post('/import', async ({ body, set }) => {
    const { collection, data } = body as { collection: string; data: unknown[] }
    const models: Record<string, any> = { items: Item, monsters: Monster, skills: Skill }
    const Model = models[collection]
    if (!Model) { set.status = 400; return { error: 'Invalid collection' } }
    const result = await Model.insertMany(data, { ordered: false })
    return { inserted: result.length }
  }, {
    body: t.Object({
      collection: t.String(),
      data: t.Array(t.Any())
    })
  })
