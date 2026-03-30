'use client'
import { useEffect } from 'react'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { ClassCard } from './ClassCard'
import { computeStats } from '@/lib/stats'
import type { Class } from '@/types'

interface ClassChainTreeProps {
  chain: Class[]
}

export function ClassChainTree({ chain }: ClassChainTreeProps) {
  const { setClassChain, baseLevel, baseStats, setBaseLevel, setBaseStat } = useSkillTreeStore()

  useEffect(() => {
    setClassChain(chain)
  }, [chain.map(c => c._id).join(',')])

  const computed = computeStats(baseLevel, baseStats)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Cards da cadeia */}
      <div className="flex-1 flex flex-col gap-3">
        {chain.map((cls, i) => (
          <ClassCard key={cls._id} cls={cls} isLast={i === chain.length - 1} />
        ))}
      </div>

      {/* Painel de stats + configuração de base */}
      <div className="w-full lg:w-64 flex flex-col gap-4 h-fit">
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-400 mb-3">Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            {Object.entries(computed).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 uppercase text-xs">{key}</span>
                <span className="text-white font-mono">{Math.floor(value)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-3">
            <label className="text-xs text-gray-400 block mb-1">Base Lv</label>
            <input
              type="number" min={1} max={175} value={baseLevel}
              onChange={e => setBaseLevel(Number(e.target.value))}
              className="w-full bg-gray-700 rounded px-2 py-1 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {(['str', 'agi', 'vit', 'int', 'dex', 'luk'] as const).map(stat => (
              <div key={stat}>
                <label className="text-xs text-gray-400 uppercase block mb-0.5">{stat}</label>
                <input
                  type="number" min={1} max={130} value={baseStats[stat]}
                  onChange={e => setBaseStat(stat, Number(e.target.value))}
                  className="w-full bg-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
