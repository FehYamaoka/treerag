# Skill Tree Revamp — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar store e componentes do simulador para suportar a cadeia completa de classes com cards colapsáveis, pool de pontos independente por classe e imagens do browiki.org.

**Architecture:** Store Zustand refatorado para `skillPoints[classId][skillId]` → `ClassChainTree` busca a cadeia via `/chain` e renderiza `ClassCard` colapsável por classe → cada card reutiliza `SkillTree` + `SkillNode` adaptados com `classId`.

**Tech Stack:** Next.js 16, React 19, Zustand, Tailwind CSS, Bun

**Pré-requisito:** Plano A (Backend) concluído — endpoint `/chain` funcionando.

**Spec:** `docs/superpowers/specs/2026-03-29-skill-tree-revamp-design.md`

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `ragtree-web/src/store/skill-tree.store.ts` | Reescrever | Store multi-classe com skillPoints aninhado |
| `ragtree-web/src/components/skill-tree/SkillNode.tsx` | Modificar | Receber `classId`, usar novo store |
| `ragtree-web/src/components/skill-tree/SkillTree.tsx` | Modificar | Remover setClass effect, passar classId |
| `ragtree-web/src/components/skill-tree/ClassCard.tsx` | Criar | Card colapsável de uma classe |
| `ragtree-web/src/components/skill-tree/ClassChainTree.tsx` | Criar | Lista de ClassCards + StatsPreview |
| `ragtree-web/src/app/classes/[slug]/ClassPageClient.tsx` | Modificar | Aceitar `chain` em vez de `cls` |
| `ragtree-web/src/app/classes/[slug]/page.tsx` | Modificar | Fetch `/chain`, passar chain ao client |
| `ragtree-web/src/components/builds/SaveBuildModal.tsx` | Modificar | Achatar skillPoints antes de salvar |
| `next.config.ts` | Modificar | Remote image patterns |

---

## Task 1: Reescrever o store multi-classe

**Files:**
- Modify: `ragtree-web/src/store/skill-tree.store.ts`

- [ ] **Step 1: Reescrever o store completo**

Substituir todo o conteúdo de `skill-tree.store.ts` por:

```ts
import { create } from 'zustand'
import type { Skill, Class } from '@/types'

interface SkillTreeState {
  classChain: Class[]
  skillPoints: Record<string, Record<string, number>> // classId → skillId → level
  baseLevel: number
  baseStats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }

  setClassChain: (chain: Class[]) => void
  setBaseLevel: (level: number) => void
  setBaseStat: (stat: string, value: number) => void
  addSkillPoint: (classId: string, skillId: string, skill: Skill) => void
  removeSkillPoint: (classId: string, skillId: string) => void
  resetClass: (classId: string) => void
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

  setClassChain: (chain) => set({ classChain: chain, skillPoints: {}, baseStats: DEFAULT_STATS }),
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

  resetAll: () => set({ skillPoints: {}, baseStats: DEFAULT_STATS }),

  getCurrentClass: () => get().classChain.at(-1) ?? null,
}))
```

- [ ] **Step 2: Escrever testes do store**

Criar `ragtree-web/src/store/skill-tree.store.test.ts`:

```ts
import { describe, test, expect, beforeEach } from 'bun:test'
import { useSkillTreeStore } from './skill-tree.store'
import type { Class, Skill } from '@/types'

const mockClass = (id: string, jobMax: number): Class => ({
  _id: id, name: 'TestClass', slug: id, description: '',
  base_level_max: 99, job_level_max: jobMax, skills: []
})

const mockSkill = (id: string, classId: string, maxLvl: number, prereqs: { skill_id: string; required_level: number }[] = []): Skill => ({
  _id: id, class_id: classId, name: id, slug: id, description: '',
  max_level: maxLvl, type: 'active', prerequisites: prereqs,
  icon_url: '', levels: []
})

beforeEach(() => {
  useSkillTreeStore.getState().setClassChain([])
})

describe('setClassChain', () => {
  test('reseta skillPoints ao mudar cadeia', () => {
    const cls = mockClass('c1', 10)
    const skill = mockSkill('s1', 'c1', 5)
    const store = useSkillTreeStore.getState()
    store.setClassChain([cls])
    store.addSkillPoint('c1', 's1', skill)
    expect(store.getSkillLevel('c1', 's1')).toBe(1)

    store.setClassChain([mockClass('c2', 10)])
    expect(useSkillTreeStore.getState().skillPoints).toEqual({})
  })
})

describe('getRemainingPoints', () => {
  test('retorna job_level_max quando nenhum ponto alocado', () => {
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('c1', 50)])
    expect(store.getRemainingPoints('c1')).toBe(50)
  })

  test('decrementa ao alocar ponto', () => {
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('c1', 50)])
    store.addSkillPoint('c1', 's1', mockSkill('s1', 'c1', 10))
    expect(useSkillTreeStore.getState().getRemainingPoints('c1')).toBe(49)
  })

  test('pontos de classes diferentes são independentes', () => {
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('c1', 40), mockClass('c2', 50)])
    store.addSkillPoint('c1', 's1', mockSkill('s1', 'c1', 10))
    const s = useSkillTreeStore.getState()
    expect(s.getRemainingPoints('c1')).toBe(39)
    expect(s.getRemainingPoints('c2')).toBe(50)
  })
})

describe('canAddPoint', () => {
  test('bloqueia quando excede job_level_max', () => {
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('c1', 1)])
    store.addSkillPoint('c1', 's1', mockSkill('s1', 'c1', 10))
    const s = useSkillTreeStore.getState()
    expect(s.canAddPoint('c1', mockSkill('s2', 'c1', 10))).toBe(false)
  })

  test('bloqueia pré-requisito não cumprido', () => {
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('c1', 50)])
    const prereqSkill = mockSkill('prereq', 'c1', 5)
    const dependentSkill = mockSkill('dep', 'c1', 5, [{ skill_id: 'prereq', required_level: 3 }])
    expect(store.canAddPoint('c1', dependentSkill)).toBe(false)
    store.addSkillPoint('c1', 'prereq', prereqSkill)
    store.addSkillPoint('c1', 'prereq', prereqSkill)
    store.addSkillPoint('c1', 'prereq', prereqSkill)
    expect(useSkillTreeStore.getState().canAddPoint('c1', dependentSkill)).toBe(true)
  })

  test('aceita pré-requisito cross-classe', () => {
    // Wizard depende de skill do Mage
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('mage', 40), mockClass('wizard', 50)])
    const mageSkill = mockSkill('lightning_bolt', 'mage', 10)
    const wizardSkill = mockSkill('jupitel', 'wizard', 10, [{ skill_id: 'lightning_bolt', required_level: 3 }])

    // Sem pré-requisito
    expect(store.canAddPoint('wizard', wizardSkill)).toBe(false)

    // Adicionar 3 levels de lightning_bolt no bucket do mage
    store.addSkillPoint('mage', 'lightning_bolt', mageSkill)
    store.addSkillPoint('mage', 'lightning_bolt', mageSkill)
    store.addSkillPoint('mage', 'lightning_bolt', mageSkill)

    expect(useSkillTreeStore.getState().canAddPoint('wizard', wizardSkill)).toBe(true)
  })
})

describe('resetClass', () => {
  test('limpa apenas o bucket da classe especificada', () => {
    const store = useSkillTreeStore.getState()
    store.setClassChain([mockClass('c1', 50), mockClass('c2', 50)])
    store.addSkillPoint('c1', 's1', mockSkill('s1', 'c1', 10))
    store.addSkillPoint('c2', 's2', mockSkill('s2', 'c2', 10))
    store.resetClass('c1')
    const s = useSkillTreeStore.getState()
    expect(s.getSkillLevel('c1', 's1')).toBe(0)
    expect(s.getSkillLevel('c2', 's2')).toBe(1)
  })
})
```

- [ ] **Step 3: Rodar testes**

```bash
cd ragtree-web
bun test src/store/skill-tree.store.test.ts
```

Esperado: todos os testes passando.

- [ ] **Step 4: Commit**

```bash
git add ragtree-web/src/store/skill-tree.store.ts ragtree-web/src/store/skill-tree.store.test.ts
git commit -m "feat: refactor skill-tree store to multi-class support"
```

---

## Task 2: Adaptar `SkillNode.tsx`

**Files:**
- Modify: `ragtree-web/src/components/skill-tree/SkillNode.tsx`

- [ ] **Step 1: Substituir o conteúdo completo do arquivo**

```tsx
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
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/components/skill-tree/SkillNode.tsx 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add ragtree-web/src/components/skill-tree/SkillNode.tsx
git commit -m "feat: add classId prop to SkillNode for multi-class store"
```

---

## Task 3: Adaptar `SkillTree.tsx`

**Files:**
- Modify: `ragtree-web/src/components/skill-tree/SkillTree.tsx`

- [ ] **Step 1: Substituir o conteúdo completo**

```tsx
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
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/components/skill-tree/SkillTree.tsx 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add ragtree-web/src/components/skill-tree/SkillTree.tsx
git commit -m "feat: remove setClass effect from SkillTree, pass classId to nodes"
```

---

## Task 4: Criar `ClassCard.tsx`

**Files:**
- Create: `ragtree-web/src/components/skill-tree/ClassCard.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
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
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/components/skill-tree/ClassCard.tsx 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add ragtree-web/src/components/skill-tree/ClassCard.tsx
git commit -m "feat: add ClassCard collapsible component"
```

---

## Task 5: Criar `ClassChainTree.tsx`

**Files:**
- Create: `ragtree-web/src/components/skill-tree/ClassChainTree.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
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
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/components/skill-tree/ClassChainTree.tsx 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add ragtree-web/src/components/skill-tree/ClassChainTree.tsx
git commit -m "feat: add ClassChainTree component with stats panel"
```

---

## Task 6: Adaptar `ClassPageClient.tsx`

**Files:**
- Modify: `ragtree-web/src/app/classes/[slug]/ClassPageClient.tsx`

- [ ] **Step 1: Substituir o conteúdo completo**

```tsx
'use client'
import { useState } from 'react'
import { ClassChainTree } from '@/components/skill-tree/ClassChainTree'
import { SaveBuildModal } from '@/components/builds/SaveBuildModal'
import type { Class } from '@/types'

interface ClassPageClientProps {
  chain: Class[]
}

export function ClassPageClient({ chain }: ClassPageClientProps) {
  const [showSave, setShowSave] = useState(false)
  const currentClass = chain.at(-1)

  return (
    <div>
      <ClassChainTree chain={chain} />

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setShowSave(true)}
          className="bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded hover:bg-yellow-400 transition-colors"
        >
          Salvar Build
        </button>
      </div>

      {showSave && currentClass && (
        <SaveBuildModal
          classId={currentClass._id}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/app/classes/[slug]/ClassPageClient.tsx 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add ragtree-web/src/app/classes/[slug]/ClassPageClient.tsx
git commit -m "feat: ClassPageClient accepts chain, renders ClassChainTree"
```

---

## Task 7: Adaptar `[slug]/page.tsx`

**Files:**
- Modify: `ragtree-web/src/app/classes/[slug]/page.tsx`

- [ ] **Step 1: Substituir o conteúdo completo**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Class } from '@/types'
import { AdBanner } from '@/components/layout/AdBanner'
import { ClassPageClient } from './ClassPageClient'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const chain = await api.get<Class[]>(`/classes/${slug}/chain`).catch(() => null)
  const cls = chain?.at(-1)
  if (!cls) return { title: 'Classe não encontrada' }
  return {
    title: `${cls.name} — Árvore de Skills | RagTree`,
    description: `Simule a build de ${cls.name} no Ragnarok LATAM. Level máximo: Base ${cls.base_level_max}, Job ${cls.job_level_max}`
  }
}

export default async function ClassPage({ params }: Props) {
  const { slug } = await params
  const chain = await api.get<Class[]>(`/classes/${slug}/chain`).catch(() => null)
  if (!chain || chain.length === 0) notFound()
  const cls = chain.at(-1)!

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        {cls.icon_url && (
          <img src={cls.icon_url} alt={cls.name} className="w-16 h-16 object-contain" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{cls.name}</h1>
          <p className="text-gray-400 text-sm">Base Lv {cls.base_level_max} • Job Lv {cls.job_level_max}</p>
        </div>
      </div>

      <p className="text-gray-300 mb-6">{cls.description}</p>

      <ClassPageClient chain={chain} />

      <AdBanner slot="0987654321" format="horizontal" className="mt-8" />

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Builds para {cls.name}</h2>
        <Link href={`/classes/${cls.slug}/builds`} className="text-yellow-400 hover:underline text-sm">
          Ver todas →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/app/classes/[slug]/page.tsx 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add ragtree-web/src/app/classes/[slug]/page.tsx
git commit -m "feat: fetch /chain endpoint in class page"
```

---

## Task 8: Adaptar `SaveBuildModal.tsx`

**Files:**
- Modify: `ragtree-web/src/components/builds/SaveBuildModal.tsx`

- [ ] **Step 1: Ler o arquivo atual para entender a estrutura**

Abrir `ragtree-web/src/components/builds/SaveBuildModal.tsx` e localizar onde `skillPoints` é lido do store.

- [ ] **Step 2: Achatar o mapa de skillPoints antes de salvar**

Encontrar a linha onde `skillPoints` é usado para montar o body do POST. Substituí-la por:

```ts
// Antes (aproximado):
// skill_points: skillPoints

// Depois:
const flatPoints = Object.values(skillPoints).reduce<Record<string, number>>(
  (acc, bucket) => ({ ...acc, ...bucket }),
  {}
)
// Usar flatPoints no body do POST
```

- [ ] **Step 3: Atualizar a prop `classId`**

O modal recebe `classId` via prop (vindo de `ClassPageClient`). Verificar se a prop já existia ou se precisa ser adicionada. O formato atual do modal pode estar lendo `cls._id` do store — ajustar para usar a prop.

- [ ] **Step 4: Verificar tipos**

```bash
cd ragtree-web
bunx tsc --noEmit 2>&1 | grep -i "src/components/builds/SaveBuildModal.tsx 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add ragtree-web/src/components/builds/SaveBuildModal.tsx
git commit -m "feat: flatten multi-class skillPoints before saving build"
```

---

## Task 9: Atualizar `next.config.ts`

**Files:**
- Modify: `ragtree-web/next.config.ts`

- [ ] **Step 1: Adicionar remote image patterns**

Localizar (ou criar) o arquivo `next.config.ts`. Adicionar `images.remotePatterns`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'browiki.org' },
      { protocol: 'https', hostname: 'static.divine-pride.net' },
    ]
  }
}

export default nextConfig
```

- [ ] **Step 2: Commit**

```bash
git add ragtree-web/next.config.ts
git commit -m "feat: add browiki.org and divine-pride to allowed image hosts"
```

---

## Task 10: Build Docker e verificação E2E

- [ ] **Step 1: Rebuild sem cache**

```bash
docker compose build --no-cache web
```

Esperado: build completo sem erros de TypeScript.

- [ ] **Step 2: Subir o container**

```bash
docker compose up -d web
sleep 5
docker compose logs web --tail=5
```

Esperado: `✓ Ready in Xms`

- [ ] **Step 3: Verificar homepage com classes pt-br**

```bash
curl -s http://localhost:3000/ | python3 -c "
import sys; c = sys.stdin.read()
print('Aprendiz na home:', 'Aprendiz' in c or 'aprendiz' in c.lower())
"
```

Esperado: `True`

- [ ] **Step 4: Verificar página da cadeia do Feiticeiro**

Abrir no browser: `http://localhost:3000/classes/sorcerer`

Verificar manualmente:
- [ ] 5 cards visíveis (Aprendiz, Mago, Sábio, Estudioso, Feiticeiro)
- [ ] Último card (Feiticeiro) começa aberto, demais colapsados
- [ ] Ícones de classe visíveis (imagens do browiki.org)
- [ ] Ícones de skills visíveis no grid
- [ ] Clicar numa skill do Mago aloca ponto no badge do card do Mago
- [ ] Badge mostra `1/40` após primeiro ponto no Mago
- [ ] Clicar direito remove o ponto

- [ ] **Step 5: Verificar pré-requisito cross-classe**

Na página do Feiticeiro:
1. Abrir card do Mago
2. Tentar clicar em "Trovão de Júpiter" no card do Mago Sábio — deve estar bloqueado
3. Alocar 3+ níveis em "Raio Elétrico" no card do Mago
4. Tentar clicar em "Trovão de Júpiter" novamente — deve liberar

- [ ] **Step 6: Verificar salvamento de build**

1. Logar com `teste@ragtree.com` / `teste123`
2. Alocar alguns pontos
3. Clicar "Salvar Build"
4. Verificar que a build é salva e redireciona para `/builds/[id]`

- [ ] **Step 7: Commit final**

```bash
git add .
git commit -m "feat: complete skill tree revamp - multi-class chain with pt-br names"
```
