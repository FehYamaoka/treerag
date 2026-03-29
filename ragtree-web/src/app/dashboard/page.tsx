'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import type { Build } from '@/types'

export default function DashboardPage() {
  const { user, isAuthenticated, getToken } = useAuthStore()
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>([])

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return }
    const token = getToken()!
    api.withAuth(token).get<{ builds: Build[] }>(`/builds?user=${user?.id}&sort=new`)
      .then(d => setBuilds(d.builds))
      .catch(() => {})
  }, [])

  const deleteBuild = async (id: string) => {
    const token = getToken()!
    await api.withAuth(token).delete(`/builds/${id}`)
    setBuilds(prev => prev.filter(b => b._id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Minhas Builds</h1>
      {builds.length === 0 && (
        <p className="text-gray-400">
          Você ainda não tem builds.{' '}
          <Link href="/classes" className="text-yellow-400 hover:underline">Crie uma!</Link>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {builds.map(build => (
          <div key={build._id} className="bg-gray-800 rounded-xl p-4">
            <Link href={`/builds/${build._id}`} className="font-semibold text-white hover:text-yellow-400">{build.title}</Link>
            <p className="text-xs text-gray-400 mt-1">👁 {build.views} • ♥ {build.likes}</p>
            <button onClick={() => deleteBuild(build._id)} className="text-red-400 text-xs mt-2 hover:text-red-300">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  )
}
