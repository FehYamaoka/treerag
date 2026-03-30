'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface Props { classId: string; onClose: () => void }

export function SaveBuildModal({ classId, onClose }: Props) {
  const { isAuthenticated, getToken } = useAuthStore()
  const { skillPoints, baseStats, equipment } = useSkillTreeStore()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated()) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <p className="text-white mb-4">Faça login para salvar sua build</p>
          <button onClick={() => router.push('/login')} className="bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold w-full">
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      const token = getToken()!
      const flatPoints = Object.values(skillPoints).reduce<Record<string, number>>(
        (acc, bucket) => ({ ...acc, ...bucket }),
        {}
      )
      // Serialize equipment: convert Item objects to IDs
      const serializedEquip: Record<string, unknown> = {}
      for (const [slot, eq] of Object.entries(equipment)) {
        if (!eq?.item_id) continue
        serializedEquip[slot] = {
          item_id: typeof eq.item_id === 'string' ? eq.item_id : eq.item_id._id,
          refine: eq.refine ?? 0,
          cards: (eq.cards ?? []).map(c => typeof c === 'string' ? c : c._id),
          enchantments: eq.enchantments ?? [],
        }
      }
      const build = await api.withAuth(token).post<{ _id: string }>('/builds', {
        class_id: classId, title, description, skill_points: flatPoints,
        base_stats: baseStats, equipment: serializedEquip, is_public: isPublic
      })
      router.push(`/builds/${build._id}`)
    } catch (err: unknown) {
      console.error('Error saving build:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Salvar Build</h2>
        <input type="text" placeholder="Nome da build" value={title} onChange={e => setTitle(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" maxLength={100} />
        <textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white h-20 resize-none" maxLength={500} />
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          Build pública
        </label>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded hover:bg-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !title.trim()}
            className="flex-1 bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
