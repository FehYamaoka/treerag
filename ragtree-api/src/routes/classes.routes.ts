import { Elysia, t } from 'elysia'
import { Class } from '../models/class.model'
import { Skill } from '../models/skill.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const classesRoutes = new Elysia({ prefix: '/classes' })
  .get('/', async () => {
    return Class.find().sort({ name: 1 }).lean()
  })

  .get('/:slug', async ({ params, set }) => {
    const cls = await Class.findOne({ slug: params.slug }).lean()
    if (!cls) { set.status = 404; return { error: 'Not found' } }
    const skills = await Skill.find({ class_id: cls._id }).lean()
    return { ...cls, skills }
  })

  .derive(authMiddleware)

  .post('/', async ({ body, set, userId, role }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    const cls = await Class.create(body)
    set.status = 201
    return cls
  }, {
    body: t.Object({
      name: t.String(),
      slug: t.String(),
      description: t.Optional(t.String()),
      base_level_max: t.Optional(t.Number()),
      job_level_max: t.Optional(t.Number()),
      parent_class_id: t.Optional(t.String()),
      icon_url: t.Optional(t.String())
    })
  })

  .put('/:id', async ({ params, body, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    const cls = await Class.findByIdAndUpdate(params.id, body, { new: true })
    if (!cls) { set.status = 404; return { error: 'Not found' } }
    return cls
  })

  .delete('/:id', async ({ params, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    await Class.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
