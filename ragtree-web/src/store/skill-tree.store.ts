import { create } from 'zustand'
import type { Skill, Class } from '@/types'

interface SkillTreeState {
  cls: Class | null
  baseLevel: number
  jobLevel: number
  baseStats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  skillPoints: Record<string, number>
  spentJobPoints: number
  setClass: (cls: Class) => void
  setBaseStat: (stat: string, value: number) => void
  setBaseLevel: (level: number) => void
  addSkillPoint: (skillId: string, skill: Skill) => void
  removeSkillPoint: (skillId: string) => void
  reset: () => void
  canAddPoint: (skill: Skill) => boolean
  getRemainingPoints: () => number
}

const DEFAULT_STATS = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 }

export const useSkillTreeStore = create<SkillTreeState>((set, get) => ({
  cls: null,
  baseLevel: 175,
  jobLevel: 60,
  baseStats: DEFAULT_STATS,
  skillPoints: {},
  spentJobPoints: 0,

  setClass: (cls) => set({ cls, skillPoints: {}, spentJobPoints: 0, baseStats: DEFAULT_STATS }),
  setBaseLevel: (level) => set({ baseLevel: level }),
  setBaseStat: (stat, value) => set(s => ({ baseStats: { ...s.baseStats, [stat]: value } })),

  addSkillPoint: (skillId, skill) => {
    const state = get()
    if (!state.canAddPoint(skill)) return
    const current = state.skillPoints[skillId] || 0
    set({
      skillPoints: { ...state.skillPoints, [skillId]: current + 1 },
      spentJobPoints: state.spentJobPoints + 1
    })
  },

  removeSkillPoint: (skillId) => {
    const state = get()
    const current = state.skillPoints[skillId] || 0
    if (current === 0) return
    set({
      skillPoints: { ...state.skillPoints, [skillId]: current - 1 },
      spentJobPoints: state.spentJobPoints - 1
    })
  },

  reset: () => set({ skillPoints: {}, spentJobPoints: 0, baseStats: DEFAULT_STATS }),

  canAddPoint: (skill) => {
    const state = get()
    const current = state.skillPoints[skill._id] || 0
    if (current >= skill.max_level) return false
    if (state.spentJobPoints >= state.jobLevel) return false
    for (const prereq of skill.prerequisites) {
      const prereqLevel = state.skillPoints[prereq.skill_id] || 0
      if (prereqLevel < prereq.required_level) return false
    }
    return true
  },

  getRemainingPoints: () => {
    const state = get()
    return state.jobLevel - state.spentJobPoints
  }
}))
