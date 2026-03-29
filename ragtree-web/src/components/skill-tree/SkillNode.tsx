'use client'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import type { Skill } from '@/types'

interface SkillNodeProps {
  skill: Skill
}

export function SkillNode({ skill }: SkillNodeProps) {
  const { skillPoints, addSkillPoint, removeSkillPoint, canAddPoint } = useSkillTreeStore()
  const current = skillPoints[skill._id] || 0
  const unlocked = current > 0 || skill.prerequisites.length === 0
  const canAdd = canAddPoint(skill)

  return (
    <div
      style={{ position: 'absolute', left: (skill.position?.x ?? 0) * 80, top: (skill.position?.y ?? 0) * 80 }}
      className="w-16"
    >
      <div
        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer select-none
          ${unlocked && canAdd ? 'border-yellow-500 bg-gray-700 hover:bg-gray-600' :
            unlocked ? 'border-yellow-700 bg-gray-700' : 'border-gray-600 bg-gray-800 opacity-50'}
          transition-all`}
        onClick={() => addSkillPoint(skill._id, skill)}
        onContextMenu={e => { e.preventDefault(); removeSkillPoint(skill._id) }}
        title={`${skill.name}\nClique: +1 | Clique direito: -1\n${skill.description}`}
      >
        {skill.icon_url
          ? <img src={skill.icon_url} alt={skill.name} className="w-10 h-10 rounded" />
          : <span className="text-xs text-center text-gray-300 px-1">{skill.name.slice(0, 8)}</span>
        }
      </div>
      <p className="text-center text-xs text-yellow-300 mt-0.5">{current}/{skill.max_level}</p>
    </div>
  )
}
