import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Build, Class, User } from '@/types'

export const revalidate = 300

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const build = await api.get<Build>(`/builds/${id}`).catch(() => null)
  if (!build) return { title: 'Build não encontrada' }
  return { title: `${build.title} — RagTree` }
}

export default async function BuildPage({ params }: Props) {
  const { id } = await params
  const build = await api.get<Build>(`/builds/${id}`).catch(() => null)
  if (!build) notFound()

  const cls = build.class_id as Class
  const user = build.user_id as User
  const stats = build.base_stats

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">{build.title}</h1>
      <p className="text-sm text-gray-400 mb-4">
        por <span className="text-yellow-400">{user?.name}</span> • {cls?.name} • ♥ {build.likes} • 👁 {build.views}
      </p>
      {build.description && <p className="text-gray-300 mb-6">{build.description}</p>}

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="text-sm text-gray-400 mb-3">Stats Base</h2>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-400 uppercase">{k}</span>
              <span className="text-white font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <h2 className="text-sm text-gray-400 mb-3">Skills</h2>
        {Object.entries(build.skill_points).map(([skillId, level]) => (
          <div key={skillId} className="flex justify-between text-sm py-1">
            <span className="text-gray-300">Skill {skillId.slice(-6)}</span>
            <span className="text-yellow-400">Nv {level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
