import { Elysia, t } from 'elysia'
import type { SortOrder } from 'mongoose'
import { Build } from '../models/build.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const buildsRoutes = new Elysia({ prefix: '/builds' })
  .get('/', async ({ query }) => {
    const { class: classSlug, sort = 'views', page = '1', limit = '20' } = query
    const filter: Record<string, unknown> = { is_public: true }
    if (classSlug) {
      const { Class } = await import('../models/class.model')
      const cls = await Class.findOne({ slug: classSlug })
      if (cls) filter.class_id = cls._id
    }
    const sortField: Record<string, SortOrder> = sort === 'likes' ? { likes: -1 } : sort === 'new' ? { createdAt: -1 } : { views: -1 }
    const skip = (Number(page) - 1) * Number(limit)
    const [builds, total] = await Promise.all([
      Build.find(filter).sort(sortField).skip(skip).limit(Number(limit))
        .populate('user_id', 'name avatar_url')
        .populate('class_id', 'name slug icon_url')
        .lean(),
      Build.countDocuments(filter)
    ])
    return { builds, total, page: Number(page), limit: Number(limit) }
  })

  .get('/:id', async ({ params, set }) => {
    const build = await Build.findById(params.id)
      .populate('user_id', 'name avatar_url')
      .populate('class_id', 'name slug icon_url')
      .lean()
    if (!build) { set.status = 404; return { error: 'Not found' } }
    await Build.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    return build
  })

  .post('/:id/view', async ({ params }) => {
    await Build.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    return { ok: true }
  })

  .derive(authMiddleware)

  .post('/', async ({ body, userId, set }: any) => {
    if (!userId) { set.status = 401; return { error: 'Unauthorized' } }
    const build = await Build.create({ ...body, user_id: userId })
    set.status = 201
    return build
  }, {
    body: t.Object({
      class_id: t.String(),
      title: t.String({ maxLength: 100 }),
      description: t.Optional(t.String({ maxLength: 500 })),
      tags: t.Optional(t.Array(t.String())),
      skill_points: t.Optional(t.Any()),
      base_stats: t.Optional(t.Object({
        str: t.Number(), agi: t.Number(), vit: t.Number(),
        int: t.Number(), dex: t.Number(), luk: t.Number()
      })),
      is_public: t.Optional(t.Boolean())
    })
  })

  .put('/:id', async ({ params, body, userId, set }: any) => {
    if (!userId) { set.status = 401; return { error: 'Unauthorized' } }
    const build = await Build.findById(params.id)
    if (!build) { set.status = 404; return { error: 'Not found' } }
    if (String(build.user_id) !== userId) { set.status = 403; return { error: 'Forbidden' } }
    return Build.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, userId, set }: any) => {
    if (!userId) { set.status = 401; return { error: 'Unauthorized' } }
    const build = await Build.findById(params.id)
    if (!build) { set.status = 404; return { error: 'Not found' } }
    if (String(build.user_id) !== userId) { set.status = 403; return { error: 'Forbidden' } }
    await build.deleteOne()
    set.status = 204
    return null
  })

  .post('/:id/like', async ({ params, userId, set }: any) => {
    if (!userId) { set.status = 401; return { error: 'Unauthorized' } }
    const build = await Build.findById(params.id)
    if (!build) return { error: 'Not found' }
    const alreadyLiked = build.liked_by.some(id => String(id) === userId)
    if (alreadyLiked) {
      await Build.findByIdAndUpdate(params.id, { $pull: { liked_by: userId }, $inc: { likes: -1 } })
      return { liked: false }
    } else {
      await Build.findByIdAndUpdate(params.id, { $push: { liked_by: userId }, $inc: { likes: 1 } })
      return { liked: true }
    }
  })
