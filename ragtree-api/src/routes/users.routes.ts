import { Elysia, t } from 'elysia'
import { User } from '../models/user.model'
import { Build } from '../models/build.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const usersRoutes = new Elysia({ prefix: '/users' })
  .get('/:username', async ({ params, set }) => {
    const user = await User.findOne({ name: params.username }, '-password -oauth_providers').lean()
    if (!user) { set.status = 404; return { error: 'Not found' } }
    return user
  })

  .get('/:username/builds', async ({ params }) => {
    const user = await User.findOne({ name: params.username })
    if (!user) return []
    return Build.find({ user_id: user._id, is_public: true }).sort({ views: -1 })
      .populate('class_id', 'name slug icon_url').lean()
  })

  .derive(authMiddleware)

  .put('/me', async ({ body, userId, set }: any) => {
    if (!userId) { set.status = 401; return { error: 'Unauthorized' } }
    return User.findByIdAndUpdate(userId, body, { new: true, select: '-password' })
  }, {
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      avatar_url: t.Optional(t.String())
    })
  })
