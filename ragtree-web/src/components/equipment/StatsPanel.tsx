'use client'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { computeFullStats, type FullStats } from '@/lib/stats'

const PRIMARY_STATS: (keyof FullStats)[] = ['atk', 'matk', 'hit', 'flee', 'crit', 'aspd', 'hp', 'sp', 'def', 'mdef', 'dps']
const SECONDARY_STATS: (keyof FullStats)[] = ['perfect_dodge', 'variable_cast_reduction', 'fixed_cast_reduction', 'after_cast_delay_reduction', 'hp_regen', 'sp_regen', 'healing_power']
const MODIFIER_STATS: (keyof FullStats)[] = ['long_range_damage', 'short_range_damage', 'damage_vs_boss', 'damage_vs_normal']
const RESIST_STATS: (keyof FullStats)[] = ['res_neutral', 'res_water', 'res_earth', 'res_fire', 'res_wind', 'res_poison', 'res_holy', 'res_dark', 'res_ghost', 'res_undead']

const LABELS: Partial<Record<keyof FullStats, string>> = {
  atk: 'ATK', matk: 'MATK', hit: 'HIT', flee: 'FLEE', crit: 'CRIT', aspd: 'ASPD',
  hp: 'HP', sp: 'SP', def: 'DEF', mdef: 'MDEF', dps: 'DPS',
  perfect_dodge: 'P.Dodge', variable_cast_reduction: 'VCT Red.', fixed_cast_reduction: 'FCT Red.',
  after_cast_delay_reduction: 'ACD Red.', hp_regen: 'HP Regen', sp_regen: 'SP Regen', healing_power: 'Heal Power',
  long_range_damage: 'Long Range', short_range_damage: 'Short Range',
  damage_vs_boss: 'vs Boss', damage_vs_normal: 'vs Normal',
  res_neutral: 'Neutro', res_water: 'Água', res_earth: 'Terra', res_fire: 'Fogo', res_wind: 'Vento',
  res_poison: 'Veneno', res_holy: 'Sagrado', res_dark: 'Sombrio', res_ghost: 'Fantasma', res_undead: 'Morto-Vivo',
}

function StatRow({ label, value, isPercent }: { label: string; value: number; isPercent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="text-white font-mono text-xs">{Math.floor(value)}{isPercent && value !== 0 ? '%' : ''}</span>
    </div>
  )
}

function Section({ title, stats, computed, isPercent }: { title: string; stats: (keyof FullStats)[]; computed: FullStats; isPercent?: boolean }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] text-yellow-500 uppercase tracking-wider mb-1">{title}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {stats.map(k => (
          <StatRow key={k} label={LABELS[k] ?? k} value={computed[k]} isPercent={isPercent} />
        ))}
      </div>
    </div>
  )
}

export function StatsPanel() {
  const { baseLevel, baseStats, equipment } = useSkillTreeStore()
  const computed = computeFullStats(baseLevel, baseStats, equipment)

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="font-semibold text-yellow-400 mb-3">Status</h3>
      <Section title="Primários" stats={PRIMARY_STATS} computed={computed} />
      <Section title="Secundários" stats={SECONDARY_STATS} computed={computed} />
      <Section title="Modifiers" stats={MODIFIER_STATS} computed={computed} isPercent />
      <Section title="Resistências" stats={RESIST_STATS} computed={computed} isPercent />
    </div>
  )
}
