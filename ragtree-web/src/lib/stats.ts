import type { Equipment, Item, EquipSlot } from '@/types'

export interface FullStats {
  status_atk: number; weapon_atk: number; atk: number; matk: number
  hit: number; flee: number; crit: number; aspd: number
  hp: number; sp: number
  hard_def: number; soft_def: number; def: number
  hard_mdef: number; soft_mdef: number; mdef: number
  dps: number
  perfect_dodge: number
  variable_cast_reduction: number; fixed_cast_reduction: number
  after_cast_delay_reduction: number
  hp_regen: number; sp_regen: number; healing_power: number
  long_range_damage: number; short_range_damage: number
  damage_vs_boss: number; damage_vs_normal: number
  res_neutral: number; res_water: number; res_earth: number
  res_fire: number; res_wind: number; res_poison: number
  res_holy: number; res_dark: number; res_ghost: number; res_undead: number
}

type BaseStats = { str: number; agi: number; vit: number; int: number; dex: number; luk: number }

const REFINE_ATK: Record<number, number> = { 1: 2, 2: 3, 3: 5, 4: 7 }

interface ResolvedEquip {
  atk: number; matk: number; def: number; mdef: number
  weapon_level: number; refine: number
  effects: Record<string, number>
}

function resolveEquipment(equipment: Equipment): ResolvedEquip {
  const r: ResolvedEquip = { atk: 0, matk: 0, def: 0, mdef: 0, weapon_level: 1, refine: 0, effects: {} }

  for (const slot of Object.keys(equipment) as EquipSlot[]) {
    const eq = equipment[slot]
    if (!eq?.item_id || typeof eq.item_id === 'string') continue
    const item = eq.item_id as Item
    const ref = eq.refine ?? 0

    if (slot === 'weapon') {
      r.atk += item.atk ?? 0
      r.matk += item.matk ?? 0
      r.weapon_level = item.weapon_level ?? 1
      r.refine = ref
      r.atk += ref * (REFINE_ATK[item.weapon_level ?? 1] ?? 2)
    } else {
      r.def += item.def ?? 0
      r.mdef += item.mdef ?? 0
      if (item.refineable !== false && ref > 0) r.def += ref
    }

    const addEffects = (eff: Record<string, unknown> | undefined) => {
      if (!eff) return
      for (const [k, v] of Object.entries(eff)) {
        if (typeof v === 'number') r.effects[k] = (r.effects[k] ?? 0) + v
      }
    }

    addEffects(item.effects)
    if (eq.cards) for (const c of eq.cards) { if (typeof c !== 'string') addEffects(c.effects) }
    if (eq.enchantments) for (const e of eq.enchantments) {
      const enc = e.enchantment_id
      if (typeof enc !== 'string') addEffects(enc.effects)
    }
  }
  return r
}

function e(eq: ResolvedEquip, key: string): number { return eq.effects[key] ?? 0 }

export function computeFullStats(
  baseLevel: number,
  stats: BaseStats,
  equipment: Equipment = {},
  skillEffects: Record<string, number> = {}
): FullStats {
  const { str, agi, vit, int: i, dex, luk } = stats
  const eq = resolveEquipment(equipment)
  const s = (k: string) => skillEffects[k] ?? 0

  const status_atk = str + Math.floor(str / 10) ** 2 + Math.floor(dex / 5) + Math.floor(luk / 3) + e(eq, 'atk') + s('atk')
  const weapon_atk = Math.floor(eq.atk * (1 + str / 200))
  const atk = status_atk + weapon_atk

  const matk = Math.floor(i * 1.5) + Math.floor(i / 5) ** 2 + Math.floor(dex / 5) + Math.floor(luk / 3) + eq.matk + e(eq, 'matk') + s('matk')
  const hit = 175 + baseLevel + dex + e(eq, 'hit') + s('hit')
  const flee = 100 + baseLevel + agi + e(eq, 'flee') + s('flee')
  const crit = 1 + Math.floor(luk * 0.3) + e(eq, 'crit') + s('crit')
  const aspd = Math.min(193, Math.max(100, Math.floor(200 - (200 - agi * 0.7 - dex * 0.1)) + e(eq, 'aspd') + s('aspd')))

  const hp = Math.floor((35 + baseLevel * 3) * (1 + vit / 100)) + e(eq, 'max_hp') + s('max_hp')
  const sp = Math.floor((10 + baseLevel) * (1 + i / 100)) + e(eq, 'max_sp') + s('max_sp')

  const hard_def = eq.def + e(eq, 'def') + s('def')
  const soft_def = Math.floor(vit / 2) + Math.floor(agi / 5) + Math.floor(baseLevel / 2)
  const hard_mdef = eq.mdef + e(eq, 'mdef') + s('mdef')
  const soft_mdef = i + Math.floor(vit / 5) + Math.floor(dex / 5) + Math.floor(baseLevel / 4)

  const dps = Math.floor(atk * (aspd / 200) * (1 + crit / 100 * 0.4))

  return {
    status_atk, weapon_atk, atk, matk, hit, flee, crit, aspd, hp, sp,
    hard_def, soft_def, def: hard_def + soft_def,
    hard_mdef, soft_mdef, mdef: hard_mdef + soft_mdef, dps,
    perfect_dodge: Math.floor(luk / 10) + e(eq, 'perfect_dodge') + s('perfect_dodge'),
    variable_cast_reduction: e(eq, 'variable_cast_reduction') + s('variable_cast_reduction'),
    fixed_cast_reduction: e(eq, 'fixed_cast_reduction') + s('fixed_cast_reduction'),
    after_cast_delay_reduction: e(eq, 'after_cast_delay_reduction') + s('after_cast_delay_reduction'),
    hp_regen: e(eq, 'hp_regen') + s('hp_regen'),
    sp_regen: e(eq, 'sp_regen') + s('sp_regen'),
    healing_power: e(eq, 'healing_power') + s('healing_power'),
    long_range_damage: e(eq, 'long_range_damage') + s('long_range_damage'),
    short_range_damage: e(eq, 'short_range_damage') + s('short_range_damage'),
    damage_vs_boss: e(eq, 'damage_vs_boss') + s('damage_vs_boss'),
    damage_vs_normal: e(eq, 'damage_vs_normal') + s('damage_vs_normal'),
    res_neutral: e(eq, 'res_neutral') + s('res_neutral'),
    res_water: e(eq, 'res_water') + s('res_water'),
    res_earth: e(eq, 'res_earth') + s('res_earth'),
    res_fire: e(eq, 'res_fire') + s('res_fire'),
    res_wind: e(eq, 'res_wind') + s('res_wind'),
    res_poison: e(eq, 'res_poison') + s('res_poison'),
    res_holy: e(eq, 'res_holy') + s('res_holy'),
    res_dark: e(eq, 'res_dark') + s('res_dark'),
    res_ghost: e(eq, 'res_ghost') + s('res_ghost'),
    res_undead: e(eq, 'res_undead') + s('res_undead'),
  }
}

// Backward compat
export type ComputedStats = FullStats
export function computeStats(baseLevel: number, stats: BaseStats): FullStats {
  return computeFullStats(baseLevel, stats)
}
