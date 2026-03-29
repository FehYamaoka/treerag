import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { connectDB } from './db/mongoose'
import { authRoutes } from './routes/auth.routes'
import { oauthRoutes } from './routes/oauth.routes'
import { classesRoutes } from './routes/classes.routes'
import { skillsRoutes } from './routes/skills.routes'
import { buildsRoutes } from './routes/builds.routes'
import { itemsRoutes } from './routes/items.routes'
import { monstersRoutes } from './routes/monsters.routes'
import { usersRoutes } from './routes/users.routes'
import { adminRoutes } from './routes/admin.routes'

await connectDB()

const app = new Elysia()
  .use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
  .use(swagger({ path: '/docs' }))
  .get('/health', () => ({ status: 'ok' }))
  .use(authRoutes)
  .use(oauthRoutes)
  .use(classesRoutes)
  .use(skillsRoutes)
  .use(buildsRoutes)
  .use(itemsRoutes)
  .use(monstersRoutes)
  .use(usersRoutes)
  .use(adminRoutes)
  .listen(process.env.PORT || 3001)

console.log(`API running at http://localhost:${app.server?.port}`)
