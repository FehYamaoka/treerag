import { create } from 'zustand'
import type { Skill, Class, Equipment, EquipSlot, EquippedItem } from '@/types'

interface SkillTreeState {
  classChain: Class[]
  skillPoints: Record<string, Record<string, number>> // classId → skillId → level
  baseLevel: number
  baseStats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  equipment: Equipment

  setClassChain: (chain: Class[]) => void
  setBaseLevel: (level: number) => void
  setBaseStat: (stat: string, value: number) => void
  addSkillPoint: (classId: string, skillId: string, skill: Skill) => void
  removeSkillPoint: (classId: string, skillId: string) => void
  resetClass: (classId: string) => void
  setEquipSlot: (slot: EquipSlot, equipped: EquippedItem) => void
  clearEquipSlot: (slot: EquipSlot) => void
  clearAllEquipment: () => void
  resetAll: () => void
  canAddPoint: (classId: string, skill: Skill) => boolean
  getRemainingPoints: (classId: string) => number
  getSkillLevel: (classId: string, skillId: string) => number
  getCurrentClass: () => Class | null
}

const DEFAULT_STATS = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 }

export const useSkillTreeStore = create<SkillTreeState>((set, get) => ({
  classChain: [],
  skillPoints: {},
  baseLevel: 175,
  baseStats: DEFAULT_STATS,
  equipment: {},

  setClassChain: (chain) => set({ classChain: chain, skillPoints: {}, baseStats: DEFAULT_STATS, equipment: {} }),
  setBaseLevel: (level) => set({ baseLevel: level }),
  setBaseStat: (stat, value) => set(s => ({ baseStats: { ...s.baseStats, [stat]: value } })),

  getSkillLevel: (classId, skillId) =>
    get().skillPoints[classId]?.[skillId] ?? 0,

  getRemainingPoints: (classId) => {
    const state = get()
    const cls = state.classChain.find(c => c._id === classId)
    const max = cls?.job_level_max ?? 0
    const spent = Object.values(state.skillPoints[classId] ?? {}).reduce((a, b) => a + b, 0)
    return max - spent
  },

  canAddPoint: (classId, skill) => {
    const state = get()
    const current = state.getSkillLevel(classId, skill._id)
    if (current >= skill.max_level) return false
    if (state.getRemainingPoints(classId) <= 0) return false
    for (const prereq of skill.prerequisites) {
      const lvl = Object.values(state.skillPoints)
        .flatMap(bucket => Object.entries(bucket))
        .find(([id]) => id === prereq.skill_id)?.[1] ?? 0
      if (lvl < prereq.required_level) return false
    }
    return true
  },

  addSkillPoint: (classId, skillId, skill) => {
    const state = get()
    if (!state.canAddPoint(classId, skill)) return
    const bucket = state.skillPoints[classId] ?? {}
    const current = bucket[skillId] ?? 0
    set({
      skillPoints: {
        ...state.skillPoints,
        [classId]: { ...bucket, [skillId]: current + 1 }
      }
    })
  },

  removeSkillPoint: (classId, skillId) => {
    const state = get()
    const bucket = state.skillPoints[classId] ?? {}
    const current = bucket[skillId] ?? 0
    if (current === 0) return
    set({
      skillPoints: {
        ...state.skillPoints,
        [classId]: { ...bucket, [skillId]: current - 1 }
      }
    })
  },

  resetClass: (classId) => {
    const state = get()
    set({ skillPoints: { ...state.skillPoints, [classId]: {} } })
  },

  setEquipSlot: (slot, equipped) => set(s => ({
    equipment: { ...s.equipment, [slot]: equipped }
  })),

  clearEquipSlot: (slot) => set(s => {
    const eq = { ...s.equipment }
    delete eq[slot]
    return { equipment: eq }
  }),

  clearAllEquipment: () => set({ equipment: {} }),

  resetAll: () => set({ skillPoints: {}, baseStats: DEFAULT_STATS, equipment: {} }),

  getCurrentClass: () => get().classChain.at(-1) ?? null,
}))
