'use client'
import { useState } from 'react'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { SkillTree } from './SkillTree'
import type { Class } from '@/types'

interface ClassCardProps {
  cls: Class
  isLast: boolean
}

export function ClassCard({ cls, isLast }: ClassCardProps) {
  const [collapsed, setCollapsed] = useState(!isLast)
  const { getRemainingPoints } = useSkillTreeStore()
  const jobMax = cls.job_level_max
  const remaining = getRemainingPoints(cls._id)
  const spent = jobMax - remaining

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
        onClick={() => setCollapsed(c => !c)}
      >
        {cls.icon_url ? (
          <img src={cls.icon_url} alt={cls.name} className="w-10 h-10 rounded object-contain bg-gray-900 p-1" />
        ) : (
          <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
            {cls.name.slice(0, 2)}
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-white">{cls.name}</p>
          <p className="text-xs text-gray-400">Job Lv {cls.job_level_max}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-mono ${spent > 0 ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-400'}`}>
          {spent}/{jobMax}
        </span>
        <span className="text-gray-400 text-sm ml-2">{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <SkillTree cls={cls} />
        </div>
      )}
    </div>
  )
}
