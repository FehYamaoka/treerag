'use client'
import { useState } from 'react'
import { SkillTree } from '@/components/skill-tree/SkillTree'
import { SaveBuildModal } from '@/components/builds/SaveBuildModal'
import type { Class } from '@/types'

interface Props { cls: Class }

export function ClassPageClient({ cls }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <SkillTree cls={cls} />
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded hover:bg-yellow-400"
        >
          Salvar Build
        </button>
      </div>
      {showModal && <SaveBuildModal classId={cls._id} onClose={() => setShowModal(false)} />}
    </div>
  )
}
