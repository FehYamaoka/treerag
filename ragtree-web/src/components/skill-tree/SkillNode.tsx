'use client'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import type { Skill } from '@/types'

interface SkillNodeProps {
  skill: Skill
  classId: string
}

export function SkillNode({ skill, classId }: SkillNodeProps) {
  const { getSkillLevel, addSkillPoint, removeSkillPoint, canAddPoint } = useSkillTreeStore()
  const current = getSkillLevel(classId, skill._id)
  const maxed = current >= skill.max_level
  const unlocked = current > 0 || skill.prerequisites.length === 0
  const canAdd = canAddPoint(classId, skill)

  const borderClass = maxed
    ? 'border-amber-500 bg-gray-700'
    : unlocked && canAdd
      ? 'border-yellow-500 bg-gray-700 hover:bg-gray-600'
      : unlocked
        ? 'border-yellow-800 bg-gray-700'
        : 'border-gray-600 bg-gray-800 opacity-50'

  return (
    <div
      style={{ position: 'absolute', left: (skill.position?.x ?? 0) * 80, top: (skill.position?.y ?? 0) * 80 }}
      className="w-16"
    >
      <div
        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer select-none transition-all ${borderClass}`}
        onClick={() => addSkillPoint(classId, skill._id, skill)}
        onContextMenu={e => { e.preventDefault(); removeSkillPoint(classId, skill._id) }}
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
