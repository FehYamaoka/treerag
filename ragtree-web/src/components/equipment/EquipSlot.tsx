'use client'
import { useState } from 'react'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { EquipModal } from './EquipModal'
import type { EquipSlot as EquipSlotType, Item } from '@/types'

const SLOT_LABELS: Record<EquipSlotType, string> = {
  head_top: 'Topo', head_mid: 'Meio', head_low: 'Baixo',
  weapon: 'Arma', shield: 'Escudo', armor: 'Armadura',
  garment: 'Capa', footgear: 'Calçado',
  accessory_l: 'Acess. E', accessory_r: 'Acess. D',
}

interface Props { slot: EquipSlotType }

export function EquipSlot({ slot }: Props) {
  const [open, setOpen] = useState(false)
  const { equipment, clearEquipSlot } = useSkillTreeStore()
  const eq = equipment[slot]
  const item = eq?.item_id && typeof eq.item_id !== 'string' ? eq.item_id as Item : null
  const refine = eq?.refine ?? 0
  const cardCount = eq?.cards?.length ?? 0

  return (
    <>
      <div
        className="w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer select-none transition-all hover:border-yellow-500"
        style={{
          borderColor: item ? '#d4a017' : '#444',
          borderStyle: item ? 'solid' : 'dashed',
          background: item ? '#1a1a0f' : '#111',
        }}
        onClick={() => setOpen(true)}
        onContextMenu={e => { e.preventDefault(); if (item) clearEquipSlot(slot) }}
        title={item ? `${item.name}${refine > 0 ? ` +${refine}` : ''}\nClique direito: remover` : `${SLOT_LABELS[slot]}\nClique para equipar`}
      >
        {item ? (
          <>
            {item.icon_url ? (
              <img src={item.icon_url} alt={item.name} className="w-10 h-10 object-contain" />
            ) : (
              <span className="text-xs text-gray-300 text-center leading-tight">{item.name.slice(0, 6)}</span>
            )}
            {refine > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[9px] font-bold px-1 rounded">+{refine}</span>
            )}
          </>
        ) : (
          <span className="text-[9px] text-gray-500 text-center leading-tight">{SLOT_LABELS[slot]}</span>
        )}
        {cardCount > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            ))}
          </div>
        )}
      </div>
      {open && <EquipModal slot={slot} onClose={() => setOpen(false)} />}
    </>
  )
}
