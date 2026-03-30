import { Elysia, t } from 'elysia'
import { Item } from '../models/item.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const itemsRoutes = new Elysia({ prefix: '/items' })
  .get('/', async ({ query }) => {
    const { type, slot, latam, q, page = '1', limit = '30' } = query
    const filter: Record<string, unknown> = {}
    if (type) filter.type = type
    if (slot) filter.equip_slot = slot
    if (latam === 'true') filter.available_latam = true
    if (q) filter.$text = { $search: q as string }
    const skip = (Number(page) - 1) * Number(limit)
    const [items, total] = await Promise.all([
      Item.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)).lean(),
      Item.countDocuments(filter)
    ])
    return { items, total, page: Number(page), limit: Number(limit) }
  })

  .get('/:slug', async ({ params, set }) => {
    const item = await Item.findOne({ slug: params.slug })
      .populate('drop_sources.monster_id', 'name slug icon_url')
      .lean()
    if (!item) { set.status = 404; return { error: 'Not found' } }
    return item
  })

  .derive(authMiddleware)

  .post('/', async ({ body, set, userId, role }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    set.status = 201
    return Item.create(body)
  }, { body: t.Any() })

  .put('/:id', async ({ params, body, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    return Item.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    await Item.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
