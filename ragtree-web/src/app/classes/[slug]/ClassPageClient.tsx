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
