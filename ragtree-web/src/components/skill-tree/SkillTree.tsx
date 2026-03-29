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
