import { Elysia } from 'elysia'
import { Enchantment } from '../models/enchantment.model'

export const enchantmentsRoutes = new Elysia({ prefix: '/enchantments' })
  .get('/', async ({ query }) => {
    const { system, latam } = query
    const filter: Record<string, unknown> = {}
    if (system) filter.system = system
    if (latam === 'true') filter.available_latam = true
    return Enchantment.find(filter).sort({ name: 1 }).lean()
  })
  .get('/:slug', async ({ params, set }) => {
    const ench = await Enchantment.findOne({ slug: params.slug }).lean()
    if (!ench) { set.status = 404; return { error: 'Not found' } }
    return ench
  })
