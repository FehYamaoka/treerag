import { Elysia, t } from 'elysia'
import { Skill } from '../models/skill.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const skillsRoutes = new Elysia({ prefix: '/skills' })
  .derive(authMiddleware)

  .post('/', async ({ body, set, userId, role }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    const skill = await Skill.create(body)
    set.status = 201
    return skill
  }, {
    body: t.Object({
      class_id: t.String(),
      name: t.String(),
      slug: t.String(),
      description: t.Optional(t.String()),
      max_level: t.Number(),
      type: t.Union([t.Literal('active'), t.Literal('passive'), t.Literal('buff'), t.Literal('support')]),
      icon_url: t.Optional(t.String()),
      prerequisites: t.Optional(t.Array(t.Object({ skill_id: t.String(), required_level: t.Number() }))),
      levels: t.Array(t.Object({ level: t.Number(), sp_cost: t.Number(), effects: t.Optional(t.Any()) })),
      position: t.Optional(t.Object({ x: t.Number(), y: t.Number() }))
    })
  })

  .put('/:id', async ({ params, body, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    return Skill.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, userId, role, set }: any) => {
    if (!userId || !['collaborator', 'admin'].includes(role as string)) {
      set.status = 403; return { error: 'Forbidden' }
    }
    await Skill.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
