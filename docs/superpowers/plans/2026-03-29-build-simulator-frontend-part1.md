# Build Simulator — Frontend Part 1: Types, Stats Engine, Store

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Expandir types, reescrever stats engine com fórmulas Renewal completas, e adicionar equipment state ao store.

**Architecture:** Types expandidos → Stats engine puro (função sem side effects) → Store ganha equipment map por slot.

**Tech Stack:** Next.js, React, Zustand, TypeScript

**Pré-requisito:** Backend Plan concluído (models expandidos, enchantments route).

---

## Task 1 — Expandir Types

**Files:**
- Modify: `ragtree-web/src/types/index.ts`

- [ ] Adicionar tipos de equipment ao arquivo. Após o `Monster` interface existente, adicionar:

```typescript
export type EquipSlot = 'weapon' | 'shield' | 'head_top' | 'head_mid' | 'head_low' | 'armor' | 'garment' | 'footgear' | 'accessory_l' | 'accessory_r'

export interface Enchantment {
  _id: string
  name: string
  slug: string
  system: 'armor' | 'archangel' | 'fallen_angel'
  effects: Record<string, number>
  icon_url?: string
  available_latam: boolean
}

export interface EquippedItem {
  item_id?: Item | string
  refine?: number
  cards?: (Item | string)[]
  enchantments?: Array<{ enchantment_id: Enchantment | string }>
}

export type Equipment = Partial<Record<EquipSlot, EquippedItem>>
```

- [ ] Expandir `Item` interface com novos campos:

```typescript
export interface Item {
  _id: string
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
  icon_url?: string
  equip_slot?: string[]
  equip_jobs?: string[]
  weapon_level?: number
  refineable?: boolean
  available_latam?: boolean
  effects?: Record<string, number>
}
```

- [ ] Expandir `Build` interface:

Substituir a interface Build por:
```typescript
export interface Build {
  _id: string
  user_id: User | string
  class_id: Class | string
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  equipment?: Equipment
  views: number
  likes: number
  is_public: boolean
  createdAt: string
}
```

- [ ] Commit:

```bash
git add ragtree-web/src/types/index.ts
git commit -m "feat: expand types with Equipment, Enchantment, EquipSlot"
```

---

## Task 2 — Reescrever Stats Engine

**Files:**
- Rewrite: `ragtree-web/src/lib/stats.ts`

- [ ] Substituir todo o conteúdo por fórmulas Renewal completas:

```typescript
import type { Equipment, Item, EquipSlot } from '@/types'

export interface FullStats {
  // Primários
  status_atk: number
  weapon_atk: number
  atk: number
  matk: number
  hit: number
  flee: number
  crit: number
  aspd: number
  hp: number
  sp: number
  hard_def: number
  soft_def: number
  def: number
  hard_mdef: number
  soft_mdef: number
  mdef: number
  dps: number
  // Secundários
  perfect_dodge: number
  variable_cast_reduction: number
  fixed_cast_reduction: number
  after_cast_delay_reduction: number
  hp_regen: number
  sp_regen: number
  healing_power: number
  // Modifiers
  long_range_damage: number
  short_range_damage: number
  damage_vs_boss: number
  damage_vs_normal: number
  // Resistências elementais
  res_neutral: number
  res_water: number
  res_earth: number
  res_fire: number
  res_wind: number
  res_poison: number
  res_holy: number
  res_dark: number
  res_ghost: number
  res_undead: number
}

type BaseStats = { str: number; agi: number; vit: number; int: number; dex: number; luk: number }

const REFINE_BONUS: Record<number, number> = { 1: 2, 2: 3, 3: 5, 4: 7 }

interface ResolvedEquip {
  atk: number; matk: number; def: number; mdef: number
  weapon_level: number; refine: number
  effects: Record<string, number>
}

function resolveEquipment(equipment: Equipment): ResolvedEquip {
  const result: ResolvedEquip = { atk: 0, matk: 0, def: 0, mdef: 0, weapon_level: 1, refine: 0, effects: {} }

  for (const slot of Object.keys(equipment) as EquipSlot[]) {
    const eq = equipment[slot]
    if (!eq?.item_id || typeof eq.item_id === 'string') continue
    const item = eq.item_id as Item
    const refine = eq.refine ?? 0

    if (slot === 'weapon') {
      result.atk += item.atk ?? 0
      result.matk += item.matk ?? 0
      result.weapon_level = item.weapon_level ?? 1
      result.refine = refine
      result.atk += refine * (REFINE_BONUS[item.weapon_level ?? 1] ?? 2)
    } else {
      result.def += item.def ?? 0
      result.mdef += item.mdef ?? 0
      if (item.refineable !== false && refine > 0) {
        result.def += refine
      }
    }

    // Sum item effects
    if (item.effects) {
      for (const [k, v] of Object.entries(item.effects)) {
        result.effects[k] = (result.effects[k] ?? 0) + (typeof v === 'number' ? v : 0)
      }
    }

    // Sum card effects
    if (eq.cards) {
      for (const card of eq.cards) {
        if (typeof card === 'string' || !card.effects) continue
        for (const [k, v] of Object.entries(card.effects)) {
          result.effects[k] = (result.effects[k] ?? 0) + (typeof v === 'number' ? v : 0)
        }
      }
    }

    // Sum enchantment effects
    if (eq.enchantments) {
      for (const ench of eq.enchantments) {
        const e = ench.enchantment_id
        if (typeof e === 'string' || !e.effects) continue
        for (const [k, v] of Object.entries(e.effects)) {
          result.effects[k] = (result.effects[k] ?? 0) + v)
        }
      }
    }
  }
  return result
}

function eff(equip: ResolvedEquip, key: string): number {
  return equip.effects[key] ?? 0
}

export function computeFullStats(
  baseLevel: number,
  stats: BaseStats,
  equipment: Equipment = {},
  skillEffects: Record<string, number> = {}
): FullStats {
  const { str, agi, vit, int: int_, dex, luk } = stats
  const eq = resolveEquipment(equipment)
  const se = (k: string) => skillEffects[k] ?? 0

  const status_atk = str + Math.floor(str / 10) ** 2 + Math.floor(dex / 5) + Math.floor(luk / 3) + eff(eq, 'atk') + se('atk')
  const weapon_atk = Math.floor(eq.atk * (1 + str / 200))
  const atk = status_atk + weapon_atk

  const matk = Math.floor(int_ * 1.5) + Math.floor(int_ / 5) ** 2 + Math.floor(dex / 5) + Math.floor(luk / 3) + eq.matk + eff(eq, 'matk') + se('matk')
  const hit = 175 + baseLevel + dex + eff(eq, 'hit') + se('hit')
  const flee = 100 + baseLevel + agi + eff(eq, 'flee') + se('flee')
  const crit = 1 + Math.floor(luk * 0.3) + eff(eq, 'crit') + se('crit')
  const aspd = Math.min(193, Math.max(100, 200 - Math.floor(200 - agi * 0.7 - dex * 0.1) + eff(eq, 'aspd') + se('aspd')))

  const hp = Math.floor((35 + baseLevel * 3) * (1 + vit / 100)) + eff(eq, 'max_hp') + se('max_hp')
  const sp = Math.floor((10 + baseLevel) * (1 + int_ / 100)) + eff(eq, 'max_sp') + se('max_sp')

  const hard_def = eq.def + eff(eq, 'def') + se('def')
  const soft_def = Math.floor(vit / 2) + Math.floor(agi / 5) + Math.floor(baseLevel / 2)
  const hard_mdef = eq.mdef + eff(eq, 'mdef') + se('mdef')
  const soft_mdef = int_ + Math.floor(vit / 5) + Math.floor(dex / 5) + Math.floor(baseLevel / 4)

  const dps = Math.floor(atk * (aspd / 200) * (1 + crit / 100 * 0.4))

  return {
    status_atk, weapon_atk, atk, matk, hit, flee, crit, aspd, hp, sp,
    hard_def, soft_def, def: hard_def + soft_def,
    hard_mdef, soft_mdef, mdef: hard_mdef + soft_mdef,
    dps,
    perfect_dodge: Math.floor(luk / 10) + eff(eq, 'perfect_dodge') + se('perfect_dodge'),
    variable_cast_reduction: eff(eq, 'variable_cast_reduction') + se('variable_cast_reduction'),
    fixed_cast_reduction: eff(eq, 'fixed_cast_reduction') + se('fixed_cast_reduction'),
    after_cast_delay_reduction: eff(eq, 'after_cast_delay_reduction') + se('after_cast_delay_reduction'),
    hp_regen: eff(eq, 'hp_regen') + se('hp_regen'),
    sp_regen: eff(eq, 'sp_regen') + se('sp_regen'),
    healing_power: eff(eq, 'healing_power') + se('healing_power'),
    long_range_damage: eff(eq, 'long_range_damage') + se('long_range_damage'),
    short_range_damage: eff(eq, 'short_range_damage') + se('short_range_damage'),
    damage_vs_boss: eff(eq, 'damage_vs_boss') + se('damage_vs_boss'),
    damage_vs_normal: eff(eq, 'damage_vs_normal') + se('damage_vs_normal'),
    res_neutral: eff(eq, 'res_neutral') + se('res_neutral'),
    res_water: eff(eq, 'res_water') + se('res_water'),
    res_earth: eff(eq, 'res_earth') + se('res_earth'),
    res_fire: eff(eq, 'res_fire') + se('res_fire'),
    res_wind: eff(eq, 'res_wind') + se('res_wind'),
    res_poison: eff(eq, 'res_poison') + se('res_poison'),
    res_holy: eff(eq, 'res_holy') + se('res_holy'),
    res_dark: eff(eq, 'res_dark') + se('res_dark'),
    res_ghost: eff(eq, 'res_ghost') + se('res_ghost'),
    res_undead: eff(eq, 'res_undead') + se('res_undead'),
  }
}

// Backward compat — usado pelo ClassChainTree existente
export type ComputedStats = FullStats
export function computeStats(baseLevel: number, stats: BaseStats): FullStats {
  return computeFullStats(baseLevel, stats)
}
```

- [ ] Commit:

```bash
git add ragtree-web/src/lib/stats.ts
git commit -m "feat: rewrite stats engine with full Renewal formulas"
```

---

## Task 3 — Adicionar Equipment ao Store

**Files:**
- Modify: `ragtree-web/src/store/skill-tree.store.ts`

- [ ] Adicionar ao interface `SkillTreeState`:

```typescript
equipment: Equipment
setEquipSlot: (slot: EquipSlot, equipped: EquippedItem) => void
clearEquipSlot: (slot: EquipSlot) => void
clearAllEquipment: () => void
```

- [ ] Adicionar import no topo:

```typescript
import type { Skill, Class, Equipment, EquipSlot, EquippedItem } from '@/types'
```

- [ ] Adicionar state e actions no create():

```typescript
equipment: {},

setEquipSlot: (slot, equipped) => set(s => ({
  equipment: { ...s.equipment, [slot]: equipped }
})),

clearEquipSlot: (slot) => set(s => {
  const eq = { ...s.equipment }
  delete eq[slot]
  return { equipment: eq }
}),

clearAllEquipment: () => set({ equipment: {} }),
```

- [ ] Atualizar `resetAll` para limpar equipment:

```typescript
resetAll: () => set({ skillPoints: {}, baseStats: DEFAULT_STATS, equipment: {} }),
```

- [ ] Atualizar `setClassChain` para limpar equipment:

```typescript
setClassChain: (chain) => set({ classChain: chain, skillPoints: {}, baseStats: DEFAULT_STATS, equipment: {} }),
```

- [ ] Commit:

```bash
git add ragtree-web/src/store/skill-tree.store.ts
git commit -m "feat: add equipment state to skill-tree store"
```
