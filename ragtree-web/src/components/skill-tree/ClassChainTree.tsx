'use client'
import { useEffect } from 'react'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { ClassCard } from './ClassCard'
import type { Class } from '@/types'

interface ClassChainTreeProps {
  chain: Class[]
}

export function ClassChainTree({ chain }: ClassChainTreeProps) {
  const { setClassChain } = useSkillTreeStore()

  useEffect(() => {
    setClassChain(chain)
  }, [chain.map(c => c._id).join(',')])

  return (
    <div className="flex flex-col gap-3">
      {chain.map((cls, i) => (
        <ClassCard key={cls._id} cls={cls} isLast={i === chain.length - 1} />
      ))}
    </div>
  )
}
