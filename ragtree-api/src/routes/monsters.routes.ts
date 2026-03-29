import { Elysia, t } from 'elysia'
import { Monster } from '../models/monster.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const monstersRoutes = new Elysia({ prefix: '/monsters' })
  .get('/', async ({ query }) => {
    const { q, page = '1', limit = '30' } = query
    const filter: Record<string, unknown> = {}
    if (q) filter.name = { $regex: q, $options: 'i' }
    const skip = (Number(page) - 1) * Number(limit)
    const [monsters, total] = await Promise.all([
      Monster.find(filter).skip(skip).limit(Number(limit)).lean(),
      Monster.countDocuments(filter)
    ])
    return { monsters, total }
  })

  .get('/:slug', async ({ params, set }) => {
    const monster = await Monster.findOne({ slug: params.slug })
      .populate('drop_items.item_id', 'name slug icon_url type')
      .lean()
    if (!monster) { set.status = 404; return { error: 'Not found' } }
    return monster
  })

  .derive(authMiddleware)

  .post('/', async ({ body, set, userId, role }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    set.status = 201
    return Monster.create(body)
  }, { body: t.Any() })

  .put('/:id', async ({ params, body, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    return Monster.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    await Monster.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
