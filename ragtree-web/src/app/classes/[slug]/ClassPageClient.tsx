'use client'
import { useState } from 'react'
import { ClassChainTree } from '@/components/skill-tree/ClassChainTree'
import { EquipmentPanel } from '@/components/equipment/EquipmentPanel'
import { StatsPanel } from '@/components/equipment/StatsPanel'
import { SaveBuildModal } from '@/components/builds/SaveBuildModal'
import type { Class } from '@/types'

interface Props { chain: Class[] }

export function ClassPageClient({ chain }: Props) {
  const [showSave, setShowSave] = useState(false)
  const currentClass = chain.at(-1)

  return (
    <div>
      {/* Equipment + Stats side by side */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <EquipmentPanel />
        </div>
        <div className="w-full lg:w-72">
          <StatsPanel />
        </div>
      </div>

      {/* Info card */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">
            {chain.map(c => c.name).join(' → ')}
          </p>
        </div>
        <button
          onClick={() => setShowSave(true)}
          className="bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded hover:bg-yellow-400 transition-colors"
        >
          Salvar Build
        </button>
      </div>

      {/* Skill Trees */}
      <ClassChainTree chain={chain} />

      {showSave && currentClass && (
        <SaveBuildModal classId={currentClass._id} onClose={() => setShowSave(false)} />
      )}
    </div>
  )
}
