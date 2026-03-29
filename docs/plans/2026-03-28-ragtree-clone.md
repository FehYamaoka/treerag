# RagTree Clone — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir um clone melhorado do ragtree.com — simulador de builds/árvore de skills do Ragnarok Online LATAM com banco de itens, ranking de builds e monetização via AdSense.

**Architecture:** Backend REST API separado do frontend. A API (Bun + Elysia) serve dados de classes, skills, itens e builds. O frontend (Next.js 15) usa SSG+ISR para páginas indexáveis (SEO → AdSense) e React client-side para o simulador interativo de skills.

**Tech Stack:** Bun, Elysia, MongoDB + Mongoose, Next.js 15 (App Router), React 19, Tailwind CSS, Zustand, JWT + bcrypt, OAuth (arctic), Docker

---

## Repositórios

Os dois repos ficam em `/home/fehyamaoka/Projects/`:
- `ragtree-api/` — Bun + Elysia
- `ragtree-web/` — Next.js 15

---

# PARTE 1 — ragtree-api

---

### Task 1: Inicializar o projeto ragtree-api

**Files:**
- Create: `ragtree-api/package.json`
- Create: `ragtree-api/src/index.ts`
- Create: `ragtree-api/tsconfig.json`
- Create: `ragtree-api/.env.example`

**Step 1: Criar o projeto**

```bash
cd /home/fehyamaoka/Projects
mkdir ragtree-api && cd ragtree-api
git init
bun init -y
```

**Step 2: Instalar dependências**

```bash
bun add elysia @elysiajs/cors @elysiajs/bearer @elysiajs/swagger
bun add mongoose bcrypt jsonwebtoken arctic
bun add -d @types/bcrypt @types/jsonwebtoken bun-types
```

**Step 3: Criar `src/index.ts`**

```typescript
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
  .use(swagger({ path: '/docs' }))
  .get('/health', () => ({ status: 'ok' }))
  .listen(process.env.PORT || 3001)

console.log(`API running at http://localhost:${app.server?.port}`)
```

**Step 4: Criar `.env.example`**

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ragtree
JWT_SECRET=change_me_in_production
JWT_REFRESH_SECRET=change_me_refresh
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

**Step 5: Adicionar scripts em `package.json`**

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "test": "bun test"
  }
}
```

**Step 6: Verificar que a API sobe**

```bash
cp .env.example .env
bun dev
# Esperado: "API running at http://localhost:3001"
# GET http://localhost:3001/health → { "status": "ok" }
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: init ragtree-api with Elysia"
```

---

### Task 2: Conexão com MongoDB

**Files:**
- Create: `src/db/mongoose.ts`

**Step 1: Criar `src/db/mongoose.ts`**

```typescript
import mongoose from 'mongoose'

let connected = false

export async function connectDB() {
  if (connected) return
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri)
  connected = true
  console.log('MongoDB connected')
}
```

**Step 2: Conectar no `src/index.ts`**

```typescript
import { connectDB } from './db/mongoose'

// Antes do .listen()
await connectDB()
```

**Step 3: Subir MongoDB com Docker para desenvolvimento**

```bash
docker run -d --name ragtree-mongo -p 27017:27017 mongo:7
```

**Step 4: Verificar conexão**

```bash
bun dev
# Esperado: "MongoDB connected" + "API running at..."
```

**Step 5: Commit**

```bash
git add src/db/mongoose.ts src/index.ts
git commit -m "feat: add MongoDB connection"
```

---

### Task 3: Models — User

**Files:**
- Create: `src/models/user.model.ts`
- Create: `src/models/user.model.test.ts`

**Step 1: Escrever o teste**

```typescript
// src/models/user.model.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import mongoose from 'mongoose'
import { User } from './user.model'

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/ragtree_test')
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('User model', () => {
  test('creates user with valid fields', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'test@test.com',
      password: 'hashed',
      role: 'user'
    })
    expect(user._id).toBeDefined()
    expect(user.role).toBe('user')
  })

  test('rejects duplicate email', async () => {
    await expect(User.create({
      name: 'Test2',
      email: 'test@test.com',
      password: 'hashed',
      role: 'user'
    })).rejects.toThrow()
  })
})
```

**Step 2: Rodar o teste (deve falhar)**

```bash
bun test src/models/user.model.test.ts
# Esperado: FAIL — "Cannot find module './user.model'"
```

**Step 3: Criar `src/models/user.model.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: 'user' | 'collaborator' | 'admin'
  oauth_providers: Array<{ provider: string; provider_id: string }>
  avatar_url?: string
  created_at: Date
  updated_at: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'collaborator', 'admin'], default: 'user' },
  oauth_providers: [{
    provider: String,
    provider_id: String
  }],
  avatar_url: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export const User = mongoose.model<IUser>('User', UserSchema)
```

**Step 4: Rodar o teste (deve passar)**

```bash
bun test src/models/user.model.test.ts
# Esperado: PASS
```

**Step 5: Commit**

```bash
git add src/models/user.model.ts src/models/user.model.test.ts
git commit -m "feat: add User model"
```

---

### Task 4: Models — Class e Skill

**Files:**
- Create: `src/models/class.model.ts`
- Create: `src/models/skill.model.ts`

**Step 1: Criar `src/models/class.model.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IClass extends Document {
  name: string
  slug: string
  description: string
  base_level_max: number
  job_level_max: number
  parent_class_id?: mongoose.Types.ObjectId
  icon_url?: string
}

const ClassSchema = new Schema<IClass>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: String,
  base_level_max: { type: Number, default: 175 },
  job_level_max: { type: Number, default: 60 },
  parent_class_id: { type: Schema.Types.ObjectId, ref: 'Class' },
  icon_url: String,
}, { timestamps: true })

export const Class = mongoose.model<IClass>('Class', ClassSchema)
```

**Step 2: Criar `src/models/skill.model.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface ISkill extends Document {
  class_id: mongoose.Types.ObjectId
  name: string
  slug: string
  description: string
  max_level: number
  type: 'active' | 'passive' | 'buff' | 'support'
  element?: string
  target?: 'self' | 'enemy' | 'ally' | 'area'
  prerequisites: Array<{ skill_id: mongoose.Types.ObjectId; required_level: number }>
  icon_url?: string
  levels: Array<{
    level: number
    sp_cost: number
    cast_time?: number
    delay?: number
    effects: Record<string, unknown>
  }>
  position?: { x: number; y: number }
}

const SkillSchema = new Schema<ISkill>({
  class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  max_level: { type: Number, required: true },
  type: { type: String, enum: ['active', 'passive', 'buff', 'support'], required: true },
  element: String,
  target: { type: String, enum: ['self', 'enemy', 'ally', 'area'] },
  prerequisites: [{
    skill_id: { type: Schema.Types.ObjectId, ref: 'Skill' },
    required_level: Number
  }],
  icon_url: String,
  levels: [{
    level: Number,
    sp_cost: Number,
    cast_time: Number,
    delay: Number,
    effects: { type: Schema.Types.Mixed, default: {} }
  }],
  position: { x: Number, y: Number }
}, { timestamps: true })

SkillSchema.index({ class_id: 1, slug: 1 }, { unique: true })

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema)
```

**Step 3: Commit**

```bash
git add src/models/class.model.ts src/models/skill.model.ts
git commit -m "feat: add Class and Skill models"
```

---

### Task 5: Models — Build, Item, Monster

**Files:**
- Create: `src/models/build.model.ts`
- Create: `src/models/item.model.ts`
- Create: `src/models/monster.model.ts`

**Step 1: Criar `src/models/build.model.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IBuild extends Document {
  user_id: mongoose.Types.ObjectId
  class_id: mongoose.Types.ObjectId
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  equipment_ids: mongoose.Types.ObjectId[]
  views: number
  likes: number
  liked_by: mongoose.Types.ObjectId[]
  is_public: boolean
}

const BuildSchema = new Schema<IBuild>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  tags: [String],
  skill_points: { type: Schema.Types.Mixed, default: {} },
  base_stats: {
    str: { type: Number, default: 1 },
    agi: { type: Number, default: 1 },
    vit: { type: Number, default: 1 },
    int: { type: Number, default: 1 },
    dex: { type: Number, default: 1 },
    luk: { type: Number, default: 1 }
  },
  equipment_ids: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_public: { type: Boolean, default: true }
}, { timestamps: true })

BuildSchema.index({ class_id: 1, views: -1 })
BuildSchema.index({ class_id: 1, likes: -1 })

export const Build = mongoose.model<IBuild>('Build', BuildSchema)
```

**Step 2: Criar `src/models/item.model.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IItem extends Document {
  name: string
  slug: string
  type: 'weapon' | 'armor' | 'card' | 'consumable' | 'misc'
  sub_type?: string
  weight?: number
  atk?: number
  matk?: number
  def?: number
  mdef?: number
  slots?: number
  required_level?: number
  required_job?: string
  effects: Record<string, unknown>
  drop_sources: Array<{ monster_id: mongoose.Types.ObjectId; rate: number }>
  npc_sell_price?: number
  icon_url?: string
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  type: { type: String, enum: ['weapon', 'armor', 'card', 'consumable', 'misc'], required: true },
  sub_type: String,
  weight: Number,
  atk: Number,
  matk: Number,
  def: Number,
  mdef: Number,
  slots: Number,
  required_level: Number,
  required_job: String,
  effects: { type: Schema.Types.Mixed, default: {} },
  drop_sources: [{
    monster_id: { type: Schema.Types.ObjectId, ref: 'Monster' },
    rate: Number
  }],
  npc_sell_price: Number,
  icon_url: String,
}, { timestamps: true })

ItemSchema.index({ name: 'text' })

export const Item = mongoose.model<IItem>('Item', ItemSchema)
```

**Step 3: Criar `src/models/monster.model.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IMonster extends Document {
  name: string
  slug: string
  level: number
  hp: number
  atk: number
  matk: number
  def: number
  mdef: number
  exp: number
  job_exp: number
  element: string
  race: string
  size: 'small' | 'medium' | 'large'
  drop_items: Array<{ item_id: mongoose.Types.ObjectId; rate: number }>
  spawn_locations: Array<{ map: string; coordinates?: string }>
  icon_url?: string
}

const MonsterSchema = new Schema<IMonster>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  level: Number,
  hp: Number,
  atk: Number,
  matk: Number,
  def: Number,
  mdef: Number,
  exp: Number,
  job_exp: Number,
  element: String,
  race: String,
  size: { type: String, enum: ['small', 'medium', 'large'] },
  drop_items: [{
    item_id: { type: Schema.Types.ObjectId, ref: 'Item' },
    rate: Number
  }],
  spawn_locations: [{
    map: String,
    coordinates: String
  }],
  icon_url: String,
}, { timestamps: true })

export const Monster = mongoose.model<IMonster>('Monster', MonsterSchema)
```

**Step 4: Commit**

```bash
git add src/models/
git commit -m "feat: add Build, Item, Monster models"
```

---

### Task 6: Auth — Middleware JWT + Role Guard

**Files:**
- Create: `src/middleware/auth.middleware.ts`
- Create: `src/middleware/role.middleware.ts`
- Create: `src/middleware/auth.middleware.test.ts`

**Step 1: Escrever teste**

```typescript
// src/middleware/auth.middleware.test.ts
import { describe, test, expect } from 'bun:test'
import jwt from 'jsonwebtoken'
import { verifyAccessToken } from './auth.middleware'

process.env.JWT_SECRET = 'test_secret'

describe('verifyAccessToken', () => {
  test('retorna payload de token válido', () => {
    const token = jwt.sign({ userId: '123', role: 'user' }, 'test_secret', { expiresIn: '15m' })
    const payload = verifyAccessToken(token)
    expect(payload.userId).toBe('123')
  })

  test('lança erro para token inválido', () => {
    expect(() => verifyAccessToken('bad_token')).toThrow()
  })
})
```

**Step 2: Rodar teste (deve falhar)**

```bash
bun test src/middleware/auth.middleware.test.ts
# Esperado: FAIL
```

**Step 3: Criar `src/middleware/auth.middleware.ts`**

```typescript
import jwt from 'jsonwebtoken'
import type { Context } from 'elysia'

export interface JWTPayload {
  userId: string
  role: 'user' | 'collaborator' | 'admin'
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' })
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload
}

export const authMiddleware = ({ headers, set }: Context) => {
  const auth = headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized' }
  }
  try {
    return verifyAccessToken(auth.slice(7))
  } catch {
    set.status = 401
    return { error: 'Invalid token' }
  }
}
```

**Step 4: Criar `src/middleware/role.middleware.ts`**

```typescript
import type { JWTPayload } from './auth.middleware'

export function requireRole(...roles: JWTPayload['role'][]) {
  return (user: JWTPayload | { error: string } | undefined, { set }: { set: { status: number } }) => {
    if (!user || 'error' in user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
    if (!roles.includes(user.role)) {
      set.status = 403
      return { error: 'Forbidden' }
    }
  }
}
```

**Step 5: Rodar teste**

```bash
bun test src/middleware/auth.middleware.test.ts
# Esperado: PASS
```

**Step 6: Commit**

```bash
git add src/middleware/
git commit -m "feat: add JWT auth and role middleware"
```

---

### Task 7: Auth Routes — Register e Login

**Files:**
- Create: `src/routes/auth.routes.ts`
- Create: `src/routes/auth.routes.test.ts`

**Step 1: Escrever testes**

```typescript
// src/routes/auth.routes.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { authRoutes } from './auth.routes'

const app = new Elysia().use(authRoutes)

beforeAll(async () => {
  process.env.JWT_SECRET = 'test'
  process.env.JWT_REFRESH_SECRET = 'test_refresh'
  await mongoose.connect('mongodb://localhost:27017/ragtree_test_auth')
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('POST /auth/register', () => {
  test('registra usuário com sucesso', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'Test@1234' })
      })
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.access_token).toBeDefined()
  })

  test('rejeita email duplicado', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test2', email: 'test@test.com', password: 'Test@1234' })
      })
    )
    expect(res.status).toBe(409)
  })
})

describe('POST /auth/login', () => {
  test('login com credenciais corretas', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'Test@1234' })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.access_token).toBeDefined()
  })

  test('rejeita senha errada', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      })
    )
    expect(res.status).toBe(401)
  })
})
```

**Step 2: Rodar testes (devem falhar)**

```bash
bun test src/routes/auth.routes.test.ts
```

**Step 3: Criar `src/routes/auth.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import bcrypt from 'bcrypt'
import { User } from '../models/user.model'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middleware/auth.middleware'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set, cookie }) => {
    const { name, email, password } = body
    const existing = await User.findOne({ email })
    if (existing) { set.status = 409; return { error: 'Email já cadastrado' } }
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed, role: 'user' })
    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    set.status = 201
    return { access_token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
  }, {
    body: t.Object({ name: t.String({ minLength: 2 }), email: t.String({ format: 'email' }), password: t.String({ minLength: 8 }) })
  })

  .post('/login', async ({ body, set, cookie }) => {
    const { email, password } = body
    const user = await User.findOne({ email })
    if (!user || !user.password) { set.status = 401; return { error: 'Credenciais inválidas' } }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) { set.status = 401; return { error: 'Credenciais inválidas' } }
    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    return { access_token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
  }, {
    body: t.Object({ email: t.String({ format: 'email' }), password: t.String() })
  })

  .post('/refresh', async ({ cookie, set }) => {
    const token = cookie.refresh_token.value
    if (!token) { set.status = 401; return { error: 'No refresh token' } }
    try {
      const payload = verifyRefreshToken(token)
      const access_token = signAccessToken({ userId: payload.userId, role: payload.role })
      return { access_token }
    } catch {
      set.status = 401
      return { error: 'Invalid refresh token' }
    }
  })

  .post('/logout', ({ cookie }) => {
    cookie.refresh_token.remove()
    return { message: 'Logged out' }
  })
```

**Step 4: Registrar rotas em `src/index.ts`**

```typescript
import { authRoutes } from './routes/auth.routes'
// Adicionar:
app.use(authRoutes)
```

**Step 5: Rodar testes**

```bash
bun test src/routes/auth.routes.test.ts
# Esperado: PASS
```

**Step 6: Commit**

```bash
git add src/routes/auth.routes.ts src/routes/auth.routes.test.ts src/index.ts
git commit -m "feat: add register and login routes"
```

---

### Task 8: Auth Routes — OAuth Google e Discord

**Files:**
- Create: `src/routes/oauth.routes.ts`

**Step 1: Instalar arctic**

```bash
bun add arctic
```

**Step 2: Criar `src/routes/oauth.routes.ts`**

```typescript
import { Elysia } from 'elysia'
import { Google, Discord } from 'arctic'
import { User } from '../models/user.model'
import { signAccessToken, signRefreshToken } from '../middleware/auth.middleware'

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.FRONTEND_URL}/api/auth/callback/google`
)

const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  `${process.env.FRONTEND_URL}/api/auth/callback/discord`
)

export const oauthRoutes = new Elysia({ prefix: '/auth' })
  .get('/google', async ({ redirect }) => {
    const state = crypto.randomUUID()
    const url = await google.createAuthorizationURL(state, crypto.randomUUID(), ['openid', 'email', 'profile'])
    return redirect(url.toString())
  })

  .get('/google/callback', async ({ query, set, cookie }) => {
    const { code } = query
    if (!code) { set.status = 400; return { error: 'No code' } }
    const tokens = await google.validateAuthorizationCode(code, crypto.randomUUID())
    const userInfo = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    }).then(r => r.json()) as { sub: string; email: string; name: string; picture: string }

    let user = await User.findOne({ 'oauth_providers.provider': 'google', 'oauth_providers.provider_id': userInfo.sub })
    if (!user) {
      user = await User.findOne({ email: userInfo.email })
      if (user) {
        user.oauth_providers.push({ provider: 'google', provider_id: userInfo.sub })
        await user.save()
      } else {
        user = await User.create({
          name: userInfo.name, email: userInfo.email, avatar_url: userInfo.picture,
          role: 'user', oauth_providers: [{ provider: 'google', provider_id: userInfo.sub }]
        })
      }
    }

    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    return redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`)
  })

  .get('/discord', async ({ redirect }) => {
    const state = crypto.randomUUID()
    const url = await discord.createAuthorizationURL(state, ['identify', 'email'])
    return redirect(url.toString())
  })

  .get('/discord/callback', async ({ query, set, cookie }) => {
    const { code } = query
    if (!code) { set.status = 400; return { error: 'No code' } }
    const tokens = await discord.validateAuthorizationCode(code)
    const userInfo = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    }).then(r => r.json()) as { id: string; email: string; username: string; avatar: string }

    let user = await User.findOne({ 'oauth_providers.provider': 'discord', 'oauth_providers.provider_id': userInfo.id })
    if (!user) {
      user = await User.findOne({ email: userInfo.email })
      if (user) {
        user.oauth_providers.push({ provider: 'discord', provider_id: userInfo.id })
        await user.save()
      } else {
        const avatarUrl = userInfo.avatar
          ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`
          : undefined
        user = await User.create({
          name: userInfo.username, email: userInfo.email, avatar_url: avatarUrl,
          role: 'user', oauth_providers: [{ provider: 'discord', provider_id: userInfo.id }]
        })
      }
    }

    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    return redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`)
  })
```

**Step 3: Registrar em `src/index.ts`**

```typescript
import { oauthRoutes } from './routes/oauth.routes'
app.use(oauthRoutes)
```

**Step 4: Commit**

```bash
git add src/routes/oauth.routes.ts src/index.ts
git commit -m "feat: add Google and Discord OAuth"
```

---

### Task 9: Classes e Skills Routes (CRUD)

**Files:**
- Create: `src/routes/classes.routes.ts`
- Create: `src/routes/skills.routes.ts`

**Step 1: Criar `src/routes/classes.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import { Class } from '../models/class.model'
import { Skill } from '../models/skill.model'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

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
  .guard({ beforeHandle: [({ role, set }) => requireRole('collaborator', 'admin')({ role } as any, { set })] })

  .post('/', async ({ body, set }) => {
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

  .put('/:id', async ({ params, body, set }) => {
    const cls = await Class.findByIdAndUpdate(params.id, body, { new: true })
    if (!cls) { set.status = 404; return { error: 'Not found' } }
    return cls
  })

  .delete('/:id', async ({ params, set }) => {
    await Class.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
```

**Step 2: Criar `src/routes/skills.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import { Skill } from '../models/skill.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const skillsRoutes = new Elysia({ prefix: '/skills' })
  .derive(authMiddleware)

  .post('/', async ({ body, set }) => {
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

  .put('/:id', async ({ params, body }) => {
    return Skill.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, set }) => {
    await Skill.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
```

**Step 3: Registrar em `src/index.ts`**

```typescript
import { classesRoutes } from './routes/classes.routes'
import { skillsRoutes } from './routes/skills.routes'
app.use(classesRoutes).use(skillsRoutes)
```

**Step 4: Testar manualmente**

```bash
# POST /auth/register → pegar access_token
# GET /classes → []
# POST /classes (com token de collaborator) → criar classe
# GET /classes/:slug → retorna classe com skills
```

**Step 5: Commit**

```bash
git add src/routes/classes.routes.ts src/routes/skills.routes.ts src/index.ts
git commit -m "feat: add classes and skills CRUD routes"
```

---

### Task 10: Builds Routes — CRUD + Ranking + Like

**Files:**
- Create: `src/routes/builds.routes.ts`

**Step 1: Criar `src/routes/builds.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import { Build } from '../models/build.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const buildsRoutes = new Elysia({ prefix: '/builds' })
  .get('/', async ({ query }) => {
    const { class: classSlug, sort = 'views', page = 1, limit = 20 } = query
    const filter: Record<string, unknown> = { is_public: true }
    if (classSlug) {
      const { Class } = await import('../models/class.model')
      const cls = await Class.findOne({ slug: classSlug })
      if (cls) filter.class_id = cls._id
    }
    const sortField = sort === 'likes' ? { likes: -1 } : sort === 'new' ? { createdAt: -1 } : { views: -1 }
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

  .post('/', async ({ body, userId, set }) => {
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

  .put('/:id', async ({ params, body, userId, set }) => {
    const build = await Build.findById(params.id)
    if (!build) { set.status = 404; return { error: 'Not found' } }
    if (String(build.user_id) !== userId) { set.status = 403; return { error: 'Forbidden' } }
    return Build.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, userId, set }) => {
    const build = await Build.findById(params.id)
    if (!build) { set.status = 404; return { error: 'Not found' } }
    if (String(build.user_id) !== userId) { set.status = 403; return { error: 'Forbidden' } }
    await build.deleteOne()
    set.status = 204
    return null
  })

  .post('/:id/like', async ({ params, userId }) => {
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
```

**Step 2: Registrar em `src/index.ts`**

```typescript
import { buildsRoutes } from './routes/builds.routes'
app.use(buildsRoutes)
```

**Step 3: Commit**

```bash
git add src/routes/builds.routes.ts src/index.ts
git commit -m "feat: add builds routes with ranking and likes"
```

---

### Task 11: Items e Monsters Routes

**Files:**
- Create: `src/routes/items.routes.ts`
- Create: `src/routes/monsters.routes.ts`

**Step 1: Criar `src/routes/items.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import { Item } from '../models/item.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const itemsRoutes = new Elysia({ prefix: '/items' })
  .get('/', async ({ query }) => {
    const { type, q, page = 1, limit = 30 } = query
    const filter: Record<string, unknown> = {}
    if (type) filter.type = type
    if (q) filter.$text = { $search: q as string }
    const skip = (Number(page) - 1) * Number(limit)
    const [items, total] = await Promise.all([
      Item.find(filter).skip(skip).limit(Number(limit)).lean(),
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

  .post('/', async ({ body, set }) => {
    set.status = 201
    return Item.create(body)
  }, { body: t.Any() })

  .put('/:id', async ({ params, body }) => {
    return Item.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, set }) => {
    await Item.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
```

**Step 2: Criar `src/routes/monsters.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import { Monster } from '../models/monster.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const monstersRoutes = new Elysia({ prefix: '/monsters' })
  .get('/', async ({ query }) => {
    const { q, page = 1, limit = 30 } = query
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

  .post('/', async ({ body, set }) => {
    set.status = 201
    return Monster.create(body)
  }, { body: t.Any() })

  .put('/:id', async ({ params, body }) => {
    return Monster.findByIdAndUpdate(params.id, body, { new: true })
  })

  .delete('/:id', async ({ params, set }) => {
    await Monster.findByIdAndDelete(params.id)
    set.status = 204
    return null
  })
```

**Step 3: Registrar em `src/index.ts`**

```typescript
import { itemsRoutes } from './routes/items.routes'
import { monstersRoutes } from './routes/monsters.routes'
app.use(itemsRoutes).use(monstersRoutes)
```

**Step 4: Commit**

```bash
git add src/routes/items.routes.ts src/routes/monsters.routes.ts src/index.ts
git commit -m "feat: add items and monsters routes"
```

---

### Task 12: Users Routes + Admin Routes

**Files:**
- Create: `src/routes/users.routes.ts`
- Create: `src/routes/admin.routes.ts`

**Step 1: Criar `src/routes/users.routes.ts`**

```typescript
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

  .put('/me', async ({ body, userId }) => {
    return User.findByIdAndUpdate(userId, body, { new: true, select: '-password' })
  }, {
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      avatar_url: t.Optional(t.String())
    })
  })
```

**Step 2: Criar `src/routes/admin.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import { User } from '../models/user.model'
import { Item } from '../models/item.model'
import { Monster } from '../models/monster.model'
import { Skill } from '../models/skill.model'
import { authMiddleware } from '../middleware/auth.middleware'

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .derive(authMiddleware)
  .guard({
    beforeHandle: ({ role, set }) => {
      if (role !== 'admin') { set.status = 403; return { error: 'Forbidden' } }
    }
  })

  .get('/users', async ({ query }) => {
    const { page = 1, limit = 50 } = query
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
    const models: Record<string, typeof Item> = { items: Item as any, monsters: Monster as any, skills: Skill as any }
    const Model = models[collection]
    if (!Model) { set.status = 400; return { error: 'Invalid collection' } }
    const result = await (Model as any).insertMany(data, { ordered: false })
    return { inserted: result.length }
  }, {
    body: t.Object({
      collection: t.String(),
      data: t.Array(t.Any())
    })
  })
```

**Step 3: Registrar em `src/index.ts`**

```typescript
import { usersRoutes } from './routes/users.routes'
import { adminRoutes } from './routes/admin.routes'
app.use(usersRoutes).use(adminRoutes)
```

**Step 4: Commit**

```bash
git add src/routes/users.routes.ts src/routes/admin.routes.ts src/index.ts
git commit -m "feat: add users and admin routes"
```

---

### Task 13: Script de Import JSON + Docker

**Files:**
- Create: `src/scripts/import.ts`
- Create: `Dockerfile`
- Create: `docker-compose.yml`

**Step 1: Criar `src/scripts/import.ts`**

```typescript
#!/usr/bin/env bun
import mongoose from 'mongoose'
import { readFileSync } from 'fs'

const [,, collection, filePath] = process.argv

if (!collection || !filePath) {
  console.error('Usage: bun run src/scripts/import.ts <collection> <file.json>')
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ragtree')

const models: Record<string, mongoose.Model<any>> = {
  items: (await import('../models/item.model')).Item,
  monsters: (await import('../models/monster.model')).Monster,
  classes: (await import('../models/class.model')).Class,
  skills: (await import('../models/skill.model')).Skill,
}

const Model = models[collection]
if (!Model) { console.error(`Unknown collection: ${collection}`); process.exit(1) }

const data = JSON.parse(readFileSync(filePath, 'utf-8'))
const arr = Array.isArray(data) ? data : [data]

const result = await Model.insertMany(arr, { ordered: false })
console.log(`✓ Imported ${result.length} documents to ${collection}`)
await mongoose.disconnect()
```

**Step 2: Criar `Dockerfile`**

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production
COPY . .
EXPOSE 3001
CMD ["bun", "src/index.ts"]
```

**Step 3: Criar `docker-compose.yml`**

```yaml
services:
  api:
    build: .
    ports:
      - "3001:3001"
    env_file: .env
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongo_data:
```

**Step 4: Adicionar script em `package.json`**

```json
{
  "scripts": {
    "import": "bun run src/scripts/import.ts"
  }
}
```

**Step 5: Testar**

```bash
# Criar um arquivo de teste
echo '[{"name":"Potion","slug":"potion","type":"consumable","weight":1}]' > /tmp/test_items.json
bun run import items /tmp/test_items.json
# Esperado: "✓ Imported 1 documents to items"
```

**Step 6: Commit**

```bash
git add src/scripts/ Dockerfile docker-compose.yml package.json
git commit -m "feat: add import script and Docker setup"
```

---

# PARTE 2 — ragtree-web

---

### Task 14: Inicializar ragtree-web

**Files:**
- Create: `ragtree-web/` (via create-next-app)

**Step 1: Criar projeto**

```bash
cd /home/fehyamaoka/Projects
bunx create-next-app@latest ragtree-web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"
cd ragtree-web
git init
```

**Step 2: Instalar dependências adicionais**

```bash
bun add zustand axios
bun add -d @types/node
```

**Step 3: Criar `.env.local`**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

**Step 4: Verificar que o app sobe**

```bash
bun dev
# Esperado: App em http://localhost:3000
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: init ragtree-web with Next.js 15"
```

---

### Task 15: API Client + Types

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/types/index.ts`

**Step 1: Criar `src/types/index.ts`**

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'collaborator' | 'admin'
  avatar_url?: string
}

export interface Class {
  _id: string
  name: string
  slug: string
  description: string
  base_level_max: number
  job_level_max: number
  parent_class_id?: string
  icon_url?: string
  skills?: Skill[]
}

export interface Skill {
  _id: string
  class_id: string
  name: string
  slug: string
  description: string
  max_level: number
  type: 'active' | 'passive' | 'buff' | 'support'
  prerequisites: Array<{ skill_id: string; required_level: number }>
  icon_url?: string
  levels: Array<{ level: number; sp_cost: number; effects: Record<string, unknown> }>
  position?: { x: number; y: number }
}

export interface Build {
  _id: string
  user_id: User | string
  class_id: Class | string
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  views: number
  likes: number
  is_public: boolean
  createdAt: string
}

export interface Item {
  _id: string
  name: string
  slug: string
  type: 'weapon' | 'armor' | 'card' | 'consumable' | 'misc'
  sub_type?: string
  weight?: number
  atk?: number
  def?: number
  slots?: number
  required_level?: number
  icon_url?: string
}

export interface Monster {
  _id: string
  name: string
  slug: string
  level: number
  hp: number
  exp: number
  element: string
  drop_items: Array<{ item_id: Item; rate: number }>
  icon_url?: string
}
```

**Step 2: Criar `src/lib/api.ts`**

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { headers }),

  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), headers }),

  put: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), headers }),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: 'DELETE', headers }),

  withAuth: (token: string) => ({
    get: <T>(path: string) => api.get<T>(path, { Authorization: `Bearer ${token}` }),
    post: <T>(path: string, body: unknown) => api.post<T>(path, body, { Authorization: `Bearer ${token}` }),
    put: <T>(path: string, body: unknown) => api.put<T>(path, body, { Authorization: `Bearer ${token}` }),
    delete: <T>(path: string) => api.delete<T>(path, { Authorization: `Bearer ${token}` }),
  })
}
```

**Step 3: Commit**

```bash
git add src/lib/api.ts src/types/index.ts
git commit -m "feat: add API client and TypeScript types"
```

---

### Task 16: Auth Store + Context

**Files:**
- Create: `src/store/auth.store.ts`
- Create: `src/components/providers/AuthProvider.tsx`

**Step 1: Criar `src/store/auth.store.ts`**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  getToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        api.post('/auth/logout', {})
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
      getToken: () => get().token,
    }),
    { name: 'ragtree-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
)
```

**Step 2: Criar `src/components/providers/AuthProvider.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout } = useAuthStore()

  useEffect(() => {
    // Tenta renovar token ao carregar
    if (token) {
      api.post<{ access_token: string }>('/auth/refresh', {})
        .then(data => {
          const { user } = useAuthStore.getState()
          if (user) setAuth(user, data.access_token)
        })
        .catch(() => logout())
    }
  }, [])

  return <>{children}</>
}
```

**Step 3: Adicionar ao layout em `src/app/layout.tsx`**

```tsx
import { AuthProvider } from '@/components/providers/AuthProvider'

// Envolver children com <AuthProvider>
```

**Step 4: Commit**

```bash
git add src/store/ src/components/providers/ src/app/layout.tsx
git commit -m "feat: add auth store and provider"
```

---

### Task 17: Layout Global + Navbar + AdSense

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/AdBanner.tsx`

**Step 1: Criar `src/components/layout/Navbar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-yellow-400 font-bold text-xl tracking-wide">
        RagTree
      </Link>
      <div className="flex items-center gap-6 text-sm text-gray-300">
        <Link href="/classes" className="hover:text-yellow-400 transition-colors">Classes</Link>
        <Link href="/items" className="hover:text-yellow-400 transition-colors">Itens</Link>
        <Link href="/builds" className="hover:text-yellow-400 transition-colors">Builds</Link>
        {isAuthenticated() ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hover:text-yellow-400">{user?.name}</Link>
            <button onClick={logout} className="text-red-400 hover:text-red-300">Sair</button>
          </div>
        ) : (
          <Link href="/login" className="bg-yellow-500 text-gray-900 px-3 py-1 rounded font-semibold hover:bg-yellow-400">
            Entrar
          </Link>
        )}
      </div>
    </nav>
  )
}
```

**Step 2: Criar `src/components/layout/AdBanner.tsx`**

```tsx
'use client'
import Script from 'next/script'
import { useEffect } from 'react'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

export function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') return null

  return (
    <>
      <ins
        className={`adsbygoogle ${className}`}
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </>
  )
}

export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') return null
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  )
}
```

**Step 3: Atualizar `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { AdSenseScript } from '@/components/layout/AdBanner'
import { AuthProvider } from '@/components/providers/AuthProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RagTree — Simulador de Builds Ragnarok LATAM',
  description: 'Simule builds, árvores de skills e veja os melhores equipamentos do Ragnarok Online LATAM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
        <AdSenseScript />
      </body>
    </html>
  )
}
```

**Step 4: Verificar visual**

```bash
bun dev
# Acessar http://localhost:3000 → Navbar escura com links
```

**Step 5: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add navbar, layout and AdSense integration"
```

---

### Task 18: Página de Login e Registro

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/app/auth/callback/page.tsx`

**Step 1: Criar `src/app/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password })
      setAuth(data.user, data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Entrar</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required />
        <button type="submit" disabled={loading}
          className="bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="flex flex-col gap-2">
          <a href={`${apiUrl}/auth/google`}
            className="bg-white text-gray-900 text-center py-2 rounded font-medium hover:bg-gray-100">
            Entrar com Google
          </a>
          <a href={`${apiUrl}/auth/discord`}
            className="bg-indigo-600 text-white text-center py-2 rounded font-medium hover:bg-indigo-500">
            Entrar com Discord
          </a>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Não tem conta? <Link href="/register" className="text-yellow-400 hover:underline">Cadastre-se</Link>
        </p>
      </form>
    </div>
  )
}
```

**Step 2: Criar `src/app/register/page.tsx`** (mesma estrutura, chamando `/auth/register`)

*Siga o mesmo padrão do login mas com campo `name` adicional e chamando `POST /auth/register`.*

**Step 3: Criar `src/app/auth/callback/page.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import type { User } from '@/types'

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { router.replace('/login'); return }
    // Fetch user info com o token
    api.withAuth(token).get<User>('/users/me')
      .then(user => { setAuth(user, token); router.replace('/dashboard') })
      .catch(() => router.replace('/login'))
  }, [])

  return <p className="text-center mt-20 text-gray-400">Autenticando...</p>
}
```

**Step 4: Commit**

```bash
git add src/app/login/ src/app/register/ src/app/auth/
git commit -m "feat: add login, register and OAuth callback pages"
```

---

### Task 19: Home Page (SSR)

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Atualizar `src/app/page.tsx`**

```tsx
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Class, Build } from '@/types'
import { AdBanner } from '@/components/layout/AdBanner'

async function getData() {
  const [classes, buildsData] = await Promise.all([
    api.get<Class[]>('/classes').catch(() => []),
    api.get<{ builds: Build[] }>('/builds?limit=6&sort=views').catch(() => ({ builds: [] }))
  ])
  return { classes, builds: buildsData.builds }
}

export default async function HomePage() {
  const { classes, builds } = await getData()

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-3">RagTree</h1>
        <p className="text-gray-400 text-lg">Simule builds, árvores de skills e explore itens do Ragnarok LATAM</p>
      </section>

      <AdBanner slot="1234567890" format="horizontal" className="my-4" />

      {/* Classes */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Classes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {classes.map(cls => (
            <Link key={cls._id} href={`/classes/${cls.slug}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center transition-colors">
              {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-10 h-10 mx-auto mb-1" />}
              <p className="text-sm text-gray-200">{cls.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Builds */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Builds em Destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {builds.map(build => (
            <Link key={build._id} href={`/builds/${build._id}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors">
              <p className="font-semibold text-white">{build.title}</p>
              <p className="text-sm text-gray-400 mt-1">
                {typeof build.class_id === 'object' ? build.class_id.name : ''} • {build.views} views
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

**Step 2: Verificar**

```bash
bun dev
# Acessar http://localhost:3000 → Home com classes e builds
```

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add home page with classes and top builds"
```

---

### Task 20: Classes List Page (SSG)

**Files:**
- Create: `src/app/classes/page.tsx`

**Step 1: Criar `src/app/classes/page.tsx`**

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Class } from '@/types'

export const metadata: Metadata = {
  title: 'Classes — RagTree',
  description: 'Todas as classes do Ragnarok Online LATAM com árvore de skills'
}

// SSG - revalidar a cada hora
export const revalidate = 3600

export default async function ClassesPage() {
  const classes = await api.get<Class[]>('/classes').catch(() => [])

  // Agrupar por classe base vs avançada
  const baseClasses = classes.filter(c => !c.parent_class_id)
  const advancedClasses = classes.filter(c => c.parent_class_id)

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-8">Classes</h1>

      <section className="mb-10">
        <h2 className="text-lg text-gray-400 mb-4">Classes Base</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {baseClasses.map(cls => (
            <Link key={cls._id} href={`/classes/${cls.slug}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
              {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-14 h-14" />}
              <p className="font-semibold text-white text-center">{cls.name}</p>
              <p className="text-xs text-gray-500">Job Lv {cls.job_level_max}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg text-gray-400 mb-4">Classes Avançadas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {advancedClasses.map(cls => (
            <Link key={cls._id} href={`/classes/${cls.slug}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
              {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-14 h-14" />}
              <p className="font-semibold text-white text-center">{cls.name}</p>
              <p className="text-xs text-gray-500">Job Lv {cls.job_level_max}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/classes/page.tsx
git commit -m "feat: add classes list page with SSG"
```

---

### Task 21: Skill Tree Simulator

**Files:**
- Create: `src/app/classes/[slug]/page.tsx`
- Create: `src/components/skill-tree/SkillTree.tsx`
- Create: `src/components/skill-tree/SkillNode.tsx`
- Create: `src/store/skill-tree.store.ts`
- Create: `src/lib/stats.ts`

**Step 1: Criar `src/store/skill-tree.store.ts`**

```typescript
import { create } from 'zustand'
import type { Skill, Class } from '@/types'

interface SkillTreeState {
  cls: Class | null
  baseLevel: number
  jobLevel: number
  baseStats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  skillPoints: Record<string, number>
  spentJobPoints: number
  setClass: (cls: Class) => void
  setBaseStat: (stat: string, value: number) => void
  setBaseLevel: (level: number) => void
  addSkillPoint: (skillId: string, skill: Skill) => void
  removeSkillPoint: (skillId: string) => void
  reset: () => void
  canAddPoint: (skill: Skill) => boolean
  getRemainingPoints: () => number
}

const DEFAULT_STATS = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 }

export const useSkillTreeStore = create<SkillTreeState>((set, get) => ({
  cls: null,
  baseLevel: 175,
  jobLevel: 60,
  baseStats: DEFAULT_STATS,
  skillPoints: {},
  spentJobPoints: 0,

  setClass: (cls) => set({ cls, skillPoints: {}, spentJobPoints: 0, baseStats: DEFAULT_STATS }),
  setBaseLevel: (level) => set({ baseLevel: level }),
  setBaseStat: (stat, value) => set(s => ({ baseStats: { ...s.baseStats, [stat]: value } })),

  addSkillPoint: (skillId, skill) => {
    const state = get()
    if (!state.canAddPoint(skill)) return
    const current = state.skillPoints[skillId] || 0
    set({
      skillPoints: { ...state.skillPoints, [skillId]: current + 1 },
      spentJobPoints: state.spentJobPoints + 1
    })
  },

  removeSkillPoint: (skillId) => {
    const state = get()
    const current = state.skillPoints[skillId] || 0
    if (current === 0) return
    set({
      skillPoints: { ...state.skillPoints, [skillId]: current - 1 },
      spentJobPoints: state.spentJobPoints - 1
    })
  },

  reset: () => set({ skillPoints: {}, spentJobPoints: 0, baseStats: DEFAULT_STATS }),

  canAddPoint: (skill) => {
    const state = get()
    const current = state.skillPoints[skill._id] || 0
    if (current >= skill.max_level) return false
    if (state.spentJobPoints >= state.jobLevel) return false
    // Verificar prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqLevel = state.skillPoints[prereq.skill_id] || 0
      if (prereqLevel < prereq.required_level) return false
    }
    return true
  },

  getRemainingPoints: () => {
    const state = get()
    return state.jobLevel - state.spentJobPoints
  }
}))
```

**Step 2: Criar `src/lib/stats.ts`**

```typescript
export interface ComputedStats {
  hp: number; sp: number; atk: number; matk: number
  def: number; mdef: number; hit: number; flee: number; crit: number; aspd: number
}

export function computeStats(
  baseLevel: number,
  stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
): ComputedStats {
  const { str, agi, vit, int: int_, dex, luk } = stats
  return {
    hp: Math.floor((35 + baseLevel * 3) * (1 + vit / 100)),
    sp: Math.floor((10 + baseLevel) * (1 + int_ / 100)),
    atk: str + Math.floor(str / 10) * Math.floor(str / 10),
    matk: Math.floor(int_ * 1.5),
    def: Math.floor(vit / 2),
    mdef: int_ + Math.floor(int_ / 5) * Math.floor(int_ / 5),
    hit: baseLevel + dex + 175,
    flee: baseLevel + agi,
    crit: Math.floor(luk * 0.3) + 1,
    aspd: Math.max(100, 200 - agi * 0.7 - dex * 0.1)
  }
}
```

**Step 3: Criar `src/components/skill-tree/SkillNode.tsx`**

```tsx
'use client'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import type { Skill } from '@/types'

interface SkillNodeProps {
  skill: Skill
}

export function SkillNode({ skill }: SkillNodeProps) {
  const { skillPoints, addSkillPoint, removeSkillPoint, canAddPoint } = useSkillTreeStore()
  const current = skillPoints[skill._id] || 0
  const unlocked = current > 0 || skill.prerequisites.length === 0

  return (
    <div
      style={{ position: 'absolute', left: (skill.position?.x ?? 0) * 80, top: (skill.position?.y ?? 0) * 80 }}
      className="w-16"
    >
      <div
        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer select-none
          ${unlocked ? 'border-yellow-500 bg-gray-700 hover:bg-gray-600' : 'border-gray-600 bg-gray-800 opacity-50'}
          transition-all`}
        onClick={() => addSkillPoint(skill._id, skill)}
        onContextMenu={e => { e.preventDefault(); removeSkillPoint(skill._id) }}
        title={`${skill.name}\nClique: +1 | Clique direito: -1\n${skill.description}`}
      >
        {skill.icon_url
          ? <img src={skill.icon_url} alt={skill.name} className="w-10 h-10 rounded" />
          : <span className="text-xs text-center text-gray-300 px-1">{skill.name.slice(0, 8)}</span>
        }
      </div>
      <p className="text-center text-xs text-yellow-300 mt-0.5">{current}/{skill.max_level}</p>
    </div>
  )
}
```

**Step 4: Criar `src/components/skill-tree/SkillTree.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { SkillNode } from './SkillNode'
import { computeStats } from '@/lib/stats'
import type { Class } from '@/types'

interface SkillTreeProps {
  cls: Class
}

export function SkillTree({ cls }: SkillTreeProps) {
  const { setClass, baseStats, baseLevel, getRemainingPoints, reset } = useSkillTreeStore()

  useEffect(() => { setClass(cls) }, [cls._id])

  const skills = cls.skills || []
  const maxX = Math.max(...skills.map(s => s.position?.x ?? 0), 5)
  const maxY = Math.max(...skills.map(s => s.position?.y ?? 0), 5)
  const computed = computeStats(baseLevel, baseStats)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Árvore */}
      <div className="flex-1">
        <div className="flex justify-between mb-3">
          <p className="text-sm text-gray-400">Pontos restantes: <span className="text-yellow-400 font-bold">{getRemainingPoints()}</span></p>
          <button onClick={reset} className="text-xs text-red-400 hover:text-red-300">Resetar</button>
        </div>
        <div className="bg-gray-800 rounded-xl overflow-auto p-4">
          <div
            className="relative"
            style={{ width: (maxX + 2) * 80, height: (maxY + 2) * 80, minWidth: 400, minHeight: 300 }}
          >
            {skills.map(skill => <SkillNode key={skill._id} skill={skill} />)}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Clique para adicionar ponto • Clique direito para remover</p>
      </div>

      {/* Stats Preview */}
      <div className="w-full lg:w-64 bg-gray-800 rounded-xl p-4 h-fit">
        <h3 className="font-semibold text-yellow-400 mb-3">Status</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(computed).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400 uppercase text-xs">{key}</span>
              <span className="text-white font-mono">{Math.floor(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Criar `src/app/classes/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import type { Class } from '@/types'
import { SkillTree } from '@/components/skill-tree/SkillTree'
import { AdBanner } from '@/components/layout/AdBanner'
import Link from 'next/link'

export const revalidate = 3600

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cls = await api.get<Class>(`/classes/${params.slug}`).catch(() => null)
  if (!cls) return { title: 'Classe não encontrada' }
  return {
    title: `${cls.name} — Árvore de Skills | RagTree`,
    description: `Simule a build de ${cls.name} no Ragnarok LATAM. Level máximo: Base ${cls.base_level_max}, Job ${cls.job_level_max}`
  }
}

export async function generateStaticParams() {
  const classes = await api.get<Class[]>('/classes').catch(() => [])
  return classes.map(c => ({ slug: c.slug }))
}

export default async function ClassPage({ params }: Props) {
  const cls = await api.get<Class>(`/classes/${params.slug}`).catch(() => null)
  if (!cls) notFound()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-16 h-16" />}
        <div>
          <h1 className="text-3xl font-bold text-white">{cls.name}</h1>
          <p className="text-gray-400 text-sm">Base Lv {cls.base_level_max} • Job Lv {cls.job_level_max}</p>
        </div>
      </div>

      <p className="text-gray-300 mb-6">{cls.description}</p>

      <SkillTree cls={cls} />

      <AdBanner slot="0987654321" format="horizontal" className="mt-8" />

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Builds para {cls.name}</h2>
        <Link href={`/classes/${cls.slug}/builds`} className="text-yellow-400 hover:underline text-sm">
          Ver todas →
        </Link>
      </div>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add src/app/classes/ src/components/skill-tree/ src/store/skill-tree.store.ts src/lib/stats.ts
git commit -m "feat: add skill tree simulator with stat preview"
```

---

### Task 22: Items Pages

**Files:**
- Create: `src/app/items/page.tsx`
- Create: `src/app/items/[slug]/page.tsx`

**Step 1: Criar `src/app/items/page.tsx`**

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Item } from '@/types'
import { AdBanner } from '@/components/layout/AdBanner'

export const metadata: Metadata = {
  title: 'Itens — RagTree',
  description: 'Banco de itens completo do Ragnarok Online LATAM'
}

interface Props { searchParams: { type?: string; q?: string; page?: string } }

export default async function ItemsPage({ searchParams }: Props) {
  const { type, q, page = '1' } = searchParams
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (q) params.set('q', q)
  params.set('page', page)
  params.set('limit', '30')

  const data = await api.get<{ items: Item[]; total: number }>(`/items?${params}`).catch(() => ({ items: [], total: 0 }))

  const types = ['weapon', 'armor', 'card', 'consumable', 'misc']

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Itens</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <Link href="/items" className={`px-3 py-1 rounded text-sm ${!type ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
          Todos
        </Link>
        {types.map(t => (
          <Link key={t} href={`/items?type=${t}`}
            className={`px-3 py-1 rounded text-sm capitalize ${type === t ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            {t}
          </Link>
        ))}
      </div>

      <AdBanner slot="1122334455" format="horizontal" className="mb-6" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.items.map(item => (
          <Link key={item._id} href={`/items/${item.slug}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors">
            {item.icon_url && <img src={item.icon_url} alt={item.name} className="w-12 h-12" />}
            <p className="text-xs text-center text-gray-200">{item.name}</p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-4">Total: {data.total} itens</p>
    </div>
  )
}
```

**Step 2: Criar `src/app/items/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Item } from '@/types'

export const revalidate = 3600
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await api.get<Item>(`/items/${params.slug}`).catch(() => null)
  if (!item) return { title: 'Item não encontrado' }
  return { title: `${item.name} — RagTree`, description: `Stats e onde dropar ${item.name} no Ragnarok LATAM` }
}

export default async function ItemPage({ params }: Props) {
  const item = await api.get<Item & { drop_sources: Array<{ monster_id: { name: string; slug: string }; rate: number }> }>(
    `/items/${params.slug}`
  ).catch(() => null)
  if (!item) notFound()

  const stats = [
    item.atk && `ATK: ${item.atk}`,
    item.def && `DEF: ${item.def}`,
    item.weight && `Peso: ${item.weight}`,
    item.slots !== undefined && `Slots: ${item.slots}`,
    item.required_level && `Lv. mín: ${item.required_level}`
  ].filter(Boolean)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        {item.icon_url && <img src={item.icon_url} alt={item.name} className="w-16 h-16" />}
        <div>
          <h1 className="text-2xl font-bold text-white">{item.name}</h1>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded capitalize">{item.type}</span>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-sm text-gray-400 mb-2">Atributos</h2>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(s => <p key={s} className="text-sm text-white">{s}</p>)}
          </div>
        </div>
      )}

      {item.drop_sources?.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm text-gray-400 mb-2">Onde dropar</h2>
          {item.drop_sources.map(ds => (
            <a key={ds.monster_id.slug} href={`/monsters/${ds.monster_id.slug}`}
              className="flex justify-between text-sm hover:text-yellow-400 py-1">
              <span>{ds.monster_id.name}</span>
              <span className="text-gray-500">{(ds.rate / 100).toFixed(2)}%</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/items/
git commit -m "feat: add items list and item detail pages"
```

---

### Task 23: Builds Pages + Ranking

**Files:**
- Create: `src/app/builds/page.tsx`
- Create: `src/app/builds/[id]/page.tsx`
- Create: `src/app/classes/[slug]/builds/page.tsx`

**Step 1: Criar `src/app/builds/page.tsx`**

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Build } from '@/types'

export const metadata: Metadata = { title: 'Builds — RagTree', description: 'As melhores builds do Ragnarok LATAM' }

interface Props { searchParams: { sort?: string; class?: string } }

export default async function BuildsPage({ searchParams }: Props) {
  const { sort = 'views', class: cls } = searchParams
  const params = new URLSearchParams({ sort, limit: '20' })
  if (cls) params.set('class', cls)

  const data = await api.get<{ builds: Build[]; total: number }>(`/builds?${params}`).catch(() => ({ builds: [], total: 0 }))

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Builds</h1>
      <div className="flex gap-3 mb-6">
        {[['views', 'Mais Vistas'], ['likes', 'Mais Curtidas'], ['new', 'Mais Recentes']].map(([val, label]) => (
          <Link key={val} href={`/builds?sort=${val}`}
            className={`px-3 py-1 rounded text-sm ${sort === val ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.builds.map(build => (
          <Link key={build._id} href={`/builds/${build._id}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-colors">
            <p className="font-semibold text-white">{build.title}</p>
            <p className="text-sm text-gray-400 mt-1">
              {typeof build.class_id === 'object' ? build.class_id.name : ''} • ♥ {build.likes} • 👁 {build.views}
            </p>
            {build.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {build.tags.map(tag => <span key={tag} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-400">{tag}</span>)}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Criar `src/app/builds/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Build, Class, User } from '@/types'

export const revalidate = 300
interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const build = await api.get<Build>(`/builds/${params.id}`).catch(() => null)
  if (!build) return { title: 'Build não encontrada' }
  return { title: `${build.title} — RagTree` }
}

export default async function BuildPage({ params }: Props) {
  const build = await api.get<Build>(`/builds/${params.id}`).catch(() => null)
  if (!build) notFound()

  const cls = build.class_id as Class
  const user = build.user_id as User
  const stats = build.base_stats

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">{build.title}</h1>
      <p className="text-sm text-gray-400 mb-4">
        por <span className="text-yellow-400">{user?.name}</span> • {cls?.name} • ♥ {build.likes} • 👁 {build.views}
      </p>
      {build.description && <p className="text-gray-300 mb-6">{build.description}</p>}

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="text-sm text-gray-400 mb-3">Stats Base</h2>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-400 uppercase">{k}</span>
              <span className="text-white font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <h2 className="text-sm text-gray-400 mb-3">Skills</h2>
        {Object.entries(build.skill_points).map(([skillId, level]) => (
          <div key={skillId} className="flex justify-between text-sm py-1">
            <span className="text-gray-300">Skill {skillId.slice(-6)}</span>
            <span className="text-yellow-400">Nv {level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/builds/
git commit -m "feat: add builds list and build detail pages"
```

---

### Task 24: Dashboard do Usuário + Salvar Build

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/builds/SaveBuildModal.tsx`

**Step 1: Criar `src/app/dashboard/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import type { Build } from '@/types'

export default function DashboardPage() {
  const { user, isAuthenticated, getToken } = useAuthStore()
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>([])

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return }
    const token = getToken()!
    api.withAuth(token).get<{ builds: Build[] }>(`/builds?user=${user?.id}&sort=new`)
      .then(d => setBuilds(d.builds))
      .catch(() => {})
  }, [])

  const deleteBuild = async (id: string) => {
    const token = getToken()!
    await api.withAuth(token).delete(`/builds/${id}`)
    setBuilds(prev => prev.filter(b => b._id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Minhas Builds</h1>
      {builds.length === 0 && <p className="text-gray-400">Você ainda não tem builds. <Link href="/classes" className="text-yellow-400 hover:underline">Crie uma!</Link></p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {builds.map(build => (
          <div key={build._id} className="bg-gray-800 rounded-xl p-4">
            <Link href={`/builds/${build._id}`} className="font-semibold text-white hover:text-yellow-400">{build.title}</Link>
            <p className="text-xs text-gray-400 mt-1">👁 {build.views} • ♥ {build.likes}</p>
            <button onClick={() => deleteBuild(build._id)} className="text-red-400 text-xs mt-2 hover:text-red-300">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Criar `src/components/builds/SaveBuildModal.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface Props { classId: string; onClose: () => void }

export function SaveBuildModal({ classId, onClose }: Props) {
  const { isAuthenticated, getToken } = useAuthStore()
  const { skillPoints, baseStats } = useSkillTreeStore()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated()) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <p className="text-white mb-4">Faça login para salvar sua build</p>
          <button onClick={() => router.push('/login')} className="bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold w-full">
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      const token = getToken()!
      const build = await api.withAuth(token).post<{ _id: string }>('/builds', {
        class_id: classId, title, description, skill_points: skillPoints,
        base_stats: baseStats, is_public: isPublic
      })
      router.push(`/builds/${build._id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Salvar Build</h2>
        <input type="text" placeholder="Nome da build" value={title} onChange={e => setTitle(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" maxLength={100} />
        <textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white h-20" maxLength={500} />
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          Build pública
        </label>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded hover:bg-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !title.trim()}
            className="flex-1 bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Integrar SaveBuildModal em `src/app/classes/[slug]/page.tsx`**

Adicionar botão "Salvar Build" que abre o modal (client component wrapper).

**Step 4: Commit**

```bash
git add src/app/dashboard/ src/components/builds/
git commit -m "feat: add dashboard and save build modal"
```

---

### Task 25: Admin Panel

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/import/page.tsx`

**Step 1: Criar `src/app/admin/page.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated() || !['admin', 'collaborator'].includes(user?.role || '')) {
      router.replace('/')
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <Link href="/admin/users" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-white">
          <p className="font-semibold">Usuários</p>
          <p className="text-sm text-gray-400">Gerenciar roles</p>
        </Link>
        <Link href="/admin/import" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-white">
          <p className="font-semibold">Importar Dados</p>
          <p className="text-sm text-gray-400">JSON para classes, skills, itens</p>
        </Link>
      </div>
    </div>
  )
}
```

**Step 2: Criar `src/app/admin/import/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

export default function ImportPage() {
  const { getToken } = useAuthStore()
  const [collection, setCollection] = useState('items')
  const [json, setJson] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setResult(null); setError(null)
    try {
      const data = JSON.parse(json)
      const token = getToken()!
      const res = await api.withAuth(token).post<{ inserted: number }>('/admin/import', {
        collection, data: Array.isArray(data) ? data : [data]
      })
      setResult(`✓ ${res.inserted} documentos importados`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-4">Importar Dados (JSON)</h1>
      <div className="flex flex-col gap-3">
        <select value={collection} onChange={e => setCollection(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-2">
          {['items', 'monsters', 'skills', 'classes'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea value={json} onChange={e => setJson(e.target.value)} rows={12}
          placeholder='[{"name":"Potion","slug":"potion","type":"consumable",...}]'
          className="bg-gray-700 text-white rounded p-3 font-mono text-sm" />
        <button onClick={handleImport} className="bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400">
          Importar
        </button>
        {result && <p className="text-green-400 text-sm">{result}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin panel with import and user management"
```

---

### Task 26: Docker para ragtree-web

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`

**Step 1: Criar `Dockerfile`**

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
```

**Step 2: Criar `docker-compose.yml`**

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file: .env.local
    restart: unless-stopped
```

**Step 3: Build de produção local**

```bash
bun run build
# Esperado: Build sem erros, páginas SSG geradas
```

**Step 4: Commit**

```bash
git add Dockerfile docker-compose.yml
git commit -m "feat: add Docker setup for production"
```

---

## Verificação End-to-End

1. **API health:** `curl http://localhost:3001/health` → `{"status":"ok"}`
2. **Auth:** `POST /auth/register` → 201 com access_token
3. **Classes SSG:** `curl http://localhost:3000/classes/swordman` → HTML com `<title>Swordman` no response (não SPA vazio)
4. **Skill tree:** Abrir `/classes/swordman` → clicar skills → ver stats mudar em tempo real
5. **Salvar build:** Login → distribuir skills → "Salvar Build" → redirect para `/builds/:id`
6. **Ranking:** `GET /builds?sort=views` → lista ordenada por views
7. **Itens:** `GET /items?type=weapon` → lista de armas com paginação
8. **Import:** POST para `/admin/import` com JSON de itens → inserção no MongoDB
9. **SEO check:** `curl http://localhost:3000/items/potion` → HTML com conteúdo do item (SSG)
10. **AdSense:** Inspecionar página em produção → script adsbygoogle presente com `strategy="lazyOnload"`
