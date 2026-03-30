'use client'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { EquipSlot } from './EquipSlot'
import type { EquipSlot as SlotType } from '@/types'

const SLOT_POSITIONS: Record<SlotType, { top: number; left: number }> = {
  head_top:    { top: 0,   left: 120 },
  head_mid:    { top: 0,   left: 200 },
  head_low:    { top: 0,   left: 280 },
  weapon:      { top: 80,  left: 40 },
  armor:       { top: 80,  left: 160 },
  shield:      { top: 80,  left: 280 },
  garment:     { top: 160, left: 80 },
  footgear:    { top: 160, left: 200 },
  accessory_l: { top: 240, left: 80 },
  accessory_r: { top: 240, left: 200 },
}

export function EquipmentPanel() {
  const { baseLevel, baseStats, setBaseLevel, setBaseStat, clearAllEquipment } = useSkillTreeStore()

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-yellow-400">Equipamento</h3>
        <button onClick={clearAllEquipment} className="text-xs text-red-400 hover:text-red-300">Limpar</button>
      </div>

      {/* Equipment grid */}
      <div className="relative mx-auto" style={{ width: 360, height: 310 }}>
        {(Object.entries(SLOT_POSITIONS) as [SlotType, { top: number; left: number }][]).map(([slot, pos]) => (
          <div key={slot} className="absolute" style={{ top: pos.top, left: pos.left }}>
            <EquipSlot slot={slot} />
          </div>
        ))}
      </div>

      {/* Base Stats */}
      <div className="border-t border-gray-700 pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-400">Base Lv</label>
          <input type="number" min={1} max={175} value={baseLevel}
            onChange={e => setBaseLevel(Number(e.target.value))}
            className="w-16 bg-gray-700 rounded px-2 py-1 text-white text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['str', 'agi', 'vit', 'int', 'dex', 'luk'] as const).map(stat => (
            <div key={stat} className="flex items-center gap-1">
              <label className="text-xs text-gray-400 uppercase w-8">{stat}</label>
              <input type="number" min={1} max={130} value={baseStats[stat]}
                onChange={e => setBaseStat(stat, Number(e.target.value))}
                className="w-14 bg-gray-700 rounded px-2 py-1 text-white text-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
