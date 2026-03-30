'use client'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { SkillNode } from './SkillNode'
import type { Class } from '@/types'

interface SkillTreeProps {
  cls: Class
}

export function SkillTree({ cls }: SkillTreeProps) {
  const { getRemainingPoints, resetClass } = useSkillTreeStore()
  const skills = cls.skills || []
  const maxX = Math.max(...skills.map(s => s.position?.x ?? 0), 5)
  const maxY = Math.max(...skills.map(s => s.position?.y ?? 0), 5)

  return (
    <div>
      <div className="flex justify-between mb-3">
        <p className="text-sm text-gray-400">
          Pontos restantes:{' '}
          <span className="text-yellow-400 font-bold">{getRemainingPoints(cls._id)}</span>
          {' '}/ {cls.job_level_max}
        </p>
        <button
          onClick={() => resetClass(cls._id)}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Resetar
        </button>
      </div>
      <div className="bg-gray-900 rounded-xl overflow-auto p-4">
        <div
          className="relative"
          style={{ width: (maxX + 2) * 80, height: (maxY + 2) * 80, minWidth: 400, minHeight: 300 }}
        >
          {skills.map(skill => (
            <SkillNode key={skill._id} skill={skill} classId={cls._id} />
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Clique para adicionar ponto • Clique direito para remover</p>
    </div>
  )
}
