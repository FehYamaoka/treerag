# Build Simulator Completo — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expandir models (Build, Item) para suportar equipment system completo com refino, cartas e encantamentos. Criar Enchantment model. Adicionar `available_latam` flag. Expandir seed data com items reais. Adicionar endpoints de filtro.

**Architecture:** Item model ganha `equip_slot`, `weapon_level`, `refineable`, `available_latam`. Build model substitui `equipment_ids` por subdocumento tipado com 10 slots (weapon, shield, head_top/mid/low, armor, garment, footgear, accessory_l/r). Novo Enchantment model. Seed data expandido com items do browiki.org.

**Tech Stack:** Bun, Elysia, Mongoose/MongoDB

**Spec:** `docs/superpowers/specs/2026-03-29-skill-tree-revamp-design.md` + `/home/felipe-de-souza-yamaoka/.claude/plans/swift-noodling-key.md`

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `ragtree-api/src/models/item.model.ts` | Modificar | Adicionar equip_slot, equip_jobs, weapon_level, refineable, available_latam |
| `ragtree-api/src/models/build.model.ts` | Modificar | Substituir equipment_ids por equipment subdoc com 10 slots |
| `ragtree-api/src/models/enchantment.model.ts` | Criar | Novo model para encantamentos |
| `ragtree-api/src/models/monster.model.ts` | Modificar | Adicionar available_latam |
| `ragtree-api/src/routes/items.routes.ts` | Modificar | Filtro por equip_slot e available_latam |
| `ragtree-api/src/routes/enchantments.routes.ts` | Criar | CRUD + listagem de enchantments |
| `ragtree-api/src/routes/builds.routes.ts` | Modificar | Aceitar equipment no POST/PUT |
| `ragtree-api/src/index.ts` | Modificar | Registrar enchantmentsRoutes |
| `ragtree-api/src/scripts/seed-data/items.ts` | Reescrever | Items expandidos com novos campos |
| `ragtree-api/src/scripts/seed-data/enchantments.ts` | Criar | Seed de enchantments |
| `ragtree-api/src/scripts/seed.ts` | Modificar | Importar e seedar enchantments |

---

## Task 1 — Expandir Item Model

**Files:**
- Modify: `ragtree-api/src/models/item.model.ts`

- [ ] **Step 1:** Adicionar novos campos à interface `IItem`:

```typescript
// Adicionar após 'icon_url?: string':
equip_slot?: string[]     // ['weapon'], ['head_top','head_mid'], ['accessory_l','accessory_r'], etc.
equip_jobs?: string[]     // ['swordsman','knight','lord-knight','rune-knight'], etc. Vazio = todas
weapon_level?: number     // 1-4, afeta bônus de refino. Só para weapons.
refineable?: boolean      // true para a maioria exceto accessories e mid/low headgear
available_latam?: boolean // true se disponível no RO LATAM
```

- [ ] **Step 2:** Adicionar campos ao Schema:

```typescript
// Após 'icon_url: String,' no ItemSchema:
equip_slot: [{ type: String, trim: true }],
equip_jobs: [{ type: String, trim: true }],
weapon_level: Number,
refineable: { type: Boolean, default: false },
available_latam: { type: Boolean, default: false },
```

- [ ] **Step 3:** Adicionar index para busca por slot:

```typescript
// Após o index existente:
ItemSchema.index({ equip_slot: 1, available_latam: 1 })
```

- [ ] **Step 4:** Verificar compilação:

```bash
cd ragtree-api && bun build --no-bundle src/models/item.model.ts 2>&1 | head -5
```

- [ ] **Step 5:** Commit:

```bash
git add ragtree-api/src/models/item.model.ts
git commit -m "feat: expand Item model with equip_slot, weapon_level, refineable, available_latam"
```

---

## Task 2 — Expandir Build Model com Equipment Subdocumento

**Files:**
- Modify: `ragtree-api/src/models/build.model.ts`

- [ ] **Step 1:** Definir o subdocumento de equipped item e atualizar a interface:

Substituir todo o conteúdo de `build.model.ts` por:

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IEquippedItem {
  item_id?: mongoose.Types.ObjectId
  refine?: number
  cards?: mongoose.Types.ObjectId[]
  enchantments?: Array<{ enchantment_id: mongoose.Types.ObjectId }>
}

export interface IEquipment {
  weapon?: IEquippedItem
  shield?: IEquippedItem
  head_top?: IEquippedItem
  head_mid?: IEquippedItem
  head_low?: IEquippedItem
  armor?: IEquippedItem
  garment?: IEquippedItem
  footgear?: IEquippedItem
  accessory_l?: IEquippedItem
  accessory_r?: IEquippedItem
}

export interface IBuild extends Document {
  user_id: mongoose.Types.ObjectId
  class_id: mongoose.Types.ObjectId
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  equipment: IEquipment
  views: number
  likes: number
  liked_by: mongoose.Types.ObjectId[]
  is_public: boolean
}

const EquippedItemSchema = new Schema<IEquippedItem>({
  item_id: { type: Schema.Types.ObjectId, ref: 'Item' },
  refine: { type: Number, default: 0, min: 0, max: 20 },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  enchantments: [{ enchantment_id: { type: Schema.Types.ObjectId, ref: 'Enchantment' } }],
}, { _id: false })

const BuildSchema = new Schema<IBuild>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  title: { type: String, required: true, maxlength: 100, trim: true },
  description: { type: String, maxlength: 500, trim: true },
  tags: [{ type: String, trim: true }],
  skill_points: { type: Schema.Types.Mixed, default: {} },
  base_stats: {
    str: { type: Number, default: 1 },
    agi: { type: Number, default: 1 },
    vit: { type: Number, default: 1 },
    int: { type: Number, default: 1 },
    dex: { type: Number, default: 1 },
    luk: { type: Number, default: 1 }
  },
  equipment: {
    weapon: { type: EquippedItemSchema, default: () => ({}) },
    shield: { type: EquippedItemSchema, default: () => ({}) },
    head_top: { type: EquippedItemSchema, default: () => ({}) },
    head_mid: { type: EquippedItemSchema, default: () => ({}) },
    head_low: { type: EquippedItemSchema, default: () => ({}) },
    armor: { type: EquippedItemSchema, default: () => ({}) },
    garment: { type: EquippedItemSchema, default: () => ({}) },
    footgear: { type: EquippedItemSchema, default: () => ({}) },
    accessory_l: { type: EquippedItemSchema, default: () => ({}) },
    accessory_r: { type: EquippedItemSchema, default: () => ({}) },
  },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_public: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

BuildSchema.index({ class_id: 1, views: -1 })
BuildSchema.index({ class_id: 1, likes: -1 })

export const Build = mongoose.model<IBuild>('Build', BuildSchema)
```

- [ ] **Step 2:** Verificar compilação:

```bash
cd ragtree-api && bun build --no-bundle src/models/build.model.ts 2>&1 | head -5
```

- [ ] **Step 3:** Commit:

```bash
git add ragtree-api/src/models/build.model.ts
git commit -m "feat: replace equipment_ids with typed 10-slot equipment subdocument"
```

---

## Task 3 — Criar Enchantment Model

**Files:**
- Create: `ragtree-api/src/models/enchantment.model.ts`

- [ ] **Step 1:** Criar o model:

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IEnchantment extends Document {
  name: string
  slug: string
  system: 'armor' | 'archangel' | 'fallen_angel'
  effects: Record<string, number>
  icon_url?: string
  available_latam: boolean
}

const EnchantmentSchema = new Schema<IEnchantment>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  system: { type: String, enum: ['armor', 'archangel', 'fallen_angel'], required: true },
  effects: { type: Schema.Types.Mixed, default: {} },
  icon_url: String,
  available_latam: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

EnchantmentSchema.index({ system: 1, available_latam: 1 })

export const Enchantment = mongoose.model<IEnchantment>('Enchantment', EnchantmentSchema)
```

- [ ] **Step 2:** Commit:

```bash
git add ragtree-api/src/models/enchantment.model.ts
git commit -m "feat: add Enchantment model with system type and effects"
```

---

## Task 4 — Adicionar available_latam ao Monster Model

**Files:**
- Modify: `ragtree-api/src/models/monster.model.ts`

- [ ] **Step 1:** Adicionar campo `available_latam` à interface e schema (mesmo padrão do Item):

Na interface `IMonster`, adicionar:
```typescript
available_latam: boolean
```

No `MonsterSchema`, adicionar antes do `timestamps`:
```typescript
available_latam: { type: Boolean, default: false },
```

- [ ] **Step 2:** Commit:

```bash
git add ragtree-api/src/models/monster.model.ts
git commit -m "feat: add available_latam flag to Monster model"
```

---

## Task 5 — Atualizar Items Route com filtros

**Files:**
- Modify: `ragtree-api/src/routes/items.routes.ts`

- [ ] **Step 1:** Expandir o handler GET `/` para suportar filtros `slot` e `latam`:

No handler `GET /`, substituir o bloco de filter por:

```typescript
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
```

- [ ] **Step 2:** Commit:

```bash
git add ragtree-api/src/routes/items.routes.ts
git commit -m "feat: add slot and latam filters to items endpoint"
```

---

## Task 6 — Criar Enchantments Route

**Files:**
- Create: `ragtree-api/src/routes/enchantments.routes.ts`
- Modify: `ragtree-api/src/index.ts`

- [ ] **Step 1:** Criar a route:

```typescript
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
```

- [ ] **Step 2:** Registrar em `index.ts` — adicionar import e `.use(enchantmentsRoutes)`:

Após a linha `import { monstersRoutes } from './routes/monsters.routes'`, adicionar:
```typescript
import { enchantmentsRoutes } from './routes/enchantments.routes'
```

Após `.use(monstersRoutes)`, adicionar:
```typescript
.use(enchantmentsRoutes)
```

- [ ] **Step 3:** Commit:

```bash
git add ragtree-api/src/routes/enchantments.routes.ts ragtree-api/src/index.ts
git commit -m "feat: add enchantments CRUD route"
```

---

## Task 7 — Atualizar Builds Route para aceitar equipment

**Files:**
- Modify: `ragtree-api/src/routes/builds.routes.ts`

- [ ] **Step 1:** No handler `POST /`, adicionar `equipment` ao body schema:

Substituir o body do POST por:
```typescript
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
  equipment: t.Optional(t.Any()),
  is_public: t.Optional(t.Boolean())
})
```

- [ ] **Step 2:** No handler `GET /:id`, popular os items referenciados no equipment:

Após o `populate('class_id')`, adicionar population dos equipment items. Substituir a query por:

```typescript
const build = await Build.findById(params.id)
  .populate('user_id', 'name avatar_url')
  .populate('class_id', 'name slug icon_url')
  .populate('equipment.weapon.item_id')
  .populate('equipment.weapon.cards')
  .populate('equipment.shield.item_id')
  .populate('equipment.shield.cards')
  .populate('equipment.head_top.item_id')
  .populate('equipment.head_top.cards')
  .populate('equipment.head_mid.item_id')
  .populate('equipment.head_mid.cards')
  .populate('equipment.head_low.item_id')
  .populate('equipment.head_low.cards')
  .populate('equipment.armor.item_id')
  .populate('equipment.armor.cards')
  .populate('equipment.garment.item_id')
  .populate('equipment.garment.cards')
  .populate('equipment.footgear.item_id')
  .populate('equipment.footgear.cards')
  .populate('equipment.accessory_l.item_id')
  .populate('equipment.accessory_l.cards')
  .populate('equipment.accessory_r.item_id')
  .populate('equipment.accessory_r.cards')
  .lean()
```

- [ ] **Step 3:** Commit:

```bash
git add ragtree-api/src/routes/builds.routes.ts
git commit -m "feat: accept equipment in build creation and populate on read"
```

---

## Task 8 — Expandir Seed Data com Items Reais

**Files:**
- Rewrite: `ragtree-api/src/scripts/seed-data/items.ts`

- [ ] **Step 1:** Reescrever `items.ts` adicionando os novos campos a todos os items existentes e adicionando mais items. Cada item agora inclui: `equip_slot`, `equip_jobs` (vazio = todas), `weapon_level` (se weapon), `refineable`, `available_latam`.

Exemplo de formato atualizado:
```typescript
{ name: 'Sword', slug: 'sword', type: 'weapon' as const, sub_type: '1h-sword',
  equip_slot: ['weapon'], equip_jobs: [], weapon_level: 1, refineable: true, available_latam: true,
  weight: 60, atk: 40, slots: 3, required_level: 1, effects: {},
  npc_sell_price: 50, icon_url: dpItem(1101) },
```

Para cards, `equip_slot` indica onde a carta pode ser inserida:
```typescript
{ name: 'Hydra Card', slug: 'hydra-card', type: 'card' as const, sub_type: 'card',
  equip_slot: ['weapon'], available_latam: true,
  weight: 1, effects: { damage_vs_demi_human: 20 },
  npc_sell_price: 10, icon_url: dpItem(4031) },
```

- [ ] **Step 2:** Adicionar mais weapons populares (pelo menos 30 weapons de diferentes tipos):
  - Daggers: Knife, Main Gauche, Dagger, Stiletto, Gladius, Damascus
  - Swords 1H: Sword, Falchion, Blade, Katana
  - Swords 2H: Slayer, Bastard Sword, Two-Handed Sword, Claymore
  - Spears: Javelin, Spear, Pike, Guisarme, Glaive, Partizan, Trident, Halberd, Lance
  - Staffs: Rod, Wand, Staff, Arc Wand, Mighty Staff
  - Bows: Bow, Composite Bow, Cross Bow, Arbalest, Hunter Bow
  - Maces: Club, Mace, Smasher, Flail, Morning Star, Chain
  - Katars: Jur, Katar, Jamadhar

- [ ] **Step 3:** Adicionar mais armors (pelo menos 20 por categoria)

- [ ] **Step 4:** Verificar compilação e commit:

```bash
cd ragtree-api && bun build --no-bundle src/scripts/seed.ts 2>&1 | head -5
git add ragtree-api/src/scripts/seed-data/items.ts
git commit -m "feat: expand seed items with equip_slot, weapon_level, refineable, available_latam"
```

---

## Task 9 — Criar Seed Data de Enchantments

**Files:**
- Create: `ragtree-api/src/scripts/seed-data/enchantments.ts`
- Modify: `ragtree-api/src/scripts/seed.ts`

- [ ] **Step 1:** Criar `enchantments.ts` com enchantments dos 3 sistemas:

```typescript
export const ENCHANTMENTS = [
  // ── Armor Enchantments (attribute +1~+3) ──
  { name: 'STR +1', slug: 'armor-str-1', system: 'armor' as const, effects: { str: 1 }, available_latam: true },
  { name: 'STR +2', slug: 'armor-str-2', system: 'armor' as const, effects: { str: 2 }, available_latam: true },
  { name: 'STR +3', slug: 'armor-str-3', system: 'armor' as const, effects: { str: 3 }, available_latam: true },
  // ... (repetir para AGI, VIT, INT, DEX, LUK)

  // ── Fallen Angel Wings Enchantments ──
  { name: 'Fighter Spirit', slug: 'faw-fighter-spirit', system: 'fallen_angel' as const, effects: { atk: 3 }, available_latam: true },
  { name: 'Super Strength', slug: 'faw-super-strength', system: 'fallen_angel' as const, effects: { str: 5 }, available_latam: true },
  { name: 'Super Agility', slug: 'faw-super-agility', system: 'fallen_angel' as const, effects: { agi: 5 }, available_latam: true },
  { name: 'Critical Stone', slug: 'faw-critical-stone', system: 'fallen_angel' as const, effects: { crit: 3 }, available_latam: true },
  { name: 'Fatal', slug: 'faw-fatal', system: 'fallen_angel' as const, effects: { crit: 5, atk: 1 }, available_latam: true },
  { name: 'Healing Factor', slug: 'faw-healing-factor', system: 'fallen_angel' as const, effects: { healing_power: 3 }, available_latam: true },
  { name: 'Attack Speed', slug: 'faw-attack-speed', system: 'fallen_angel' as const, effects: { aspd: 1 }, available_latam: true },
  { name: 'Piercing Shot', slug: 'faw-piercing-shot', system: 'fallen_angel' as const, effects: { long_range_damage: 2 }, available_latam: true },
  // ... mais enchantments
]
```

- [ ] **Step 2:** Adicionar import e seed no `seed.ts`:

Após os imports existentes:
```typescript
import { Enchantment } from '../models/enchantment.model'
import { ENCHANTMENTS } from './seed-data/enchantments'
```

Na função `seed()`, após `await Monster.deleteMany({})`:
```typescript
await Enchantment.deleteMany({})
```

Após o bloco de MONSTERS:
```typescript
if (ENCHANTMENTS.length) { await Enchantment.insertMany(ENCHANTMENTS as any[]); console.log(`✅ ${ENCHANTMENTS.length} enchantments`) }
```

- [ ] **Step 3:** Commit:

```bash
git add ragtree-api/src/scripts/seed-data/enchantments.ts ragtree-api/src/scripts/seed.ts ragtree-api/src/models/enchantment.model.ts
git commit -m "feat: add enchantment seed data and wire into seed script"
```

---

## Task 10 — Verificar seed completo no Docker

- [ ] **Step 1:** Rebuild e rodar seed:

```bash
docker compose build --no-cache api
docker compose up -d mongo api
sleep 5
docker compose exec -T api bun src/scripts/seed.ts
```

Esperado:
```
MongoDB connected
🌱 Seeding...
✅ 46 classes
✅ 303 skills
✅ ~100+ items
✅ 40 monsters
✅ ~30+ enchantments
🎉 Done!
```

- [ ] **Step 2:** Verificar filtros:

```bash
curl -s "http://localhost:3001/items?slot=weapon&latam=true" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'], 'weapons LATAM')"
curl -s "http://localhost:3001/enchantments?system=armor" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'armor enchantments')"
curl -s "http://localhost:3001/classes/sorcerer/chain" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'classes na cadeia')"
```

- [ ] **Step 3:** Commit final se necessário:

```bash
git add -A && git commit -m "fix: seed verification and adjustments"
```

---

## Verificação Final do Backend

```bash
# 1. Seed completo
docker compose exec -T api bun src/scripts/seed.ts

# 2. Items filtrados por slot
curl -s "http://localhost:3001/items?slot=weapon" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'], 'weapons')"

# 3. Items filtrados por LATAM
curl -s "http://localhost:3001/items?latam=true" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'], 'items LATAM')"

# 4. Enchantments
curl -s "http://localhost:3001/enchantments" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'enchantments')"

# 5. Chain endpoint ainda funciona
curl -s "http://localhost:3001/classes/rune-knight/chain" | python3 -c "import sys,json; d=json.load(sys.stdin); print([c['name'] for c in d])"
```

Após confirmar tudo: **avançar para o Plano Frontend.**
