import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Build } from '@/types'

export const metadata: Metadata = { title: 'Builds — RagTree', description: 'As melhores builds do Ragnarok LATAM' }

interface Props { searchParams: Promise<{ sort?: string; class?: string }> }

export default async function BuildsPage({ searchParams }: Props) {
  const { sort = 'views', class: cls } = await searchParams
  const params = new URLSearchParams({ sort, limit: '20' })
  if (cls) params.set('class', cls)

  const data = await api.get<{ builds: Build[]; total: number }>(`/builds?${params}`).catch(() => ({ builds: [] as Build[], total: 0 }))

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Builds</h1>
      <div className="flex gap-3 mb-6">
        {([['views', 'Mais Vistas'], ['likes', 'Mais Curtidas'], ['new', 'Mais Recentes']] as const).map(([val, label]) => (
          <Link key={val} href={`/builds?sort=${val}`}
            className={`px-3 py-1 rounded text-sm ${sort === val ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.builds.map(build => (
          <Link key={build._id} href={`/builds/${build._id}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-colors">
            <p className="font-semibold text-white">{build.title}</p>
            <p className="text-sm text-gray-400 mt-1">
              {typeof build.class_id === 'object' ? build.class_id.name : ''} • ♥ {build.likes} • 👁 {build.views}
            </p>
            {build.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {build.tags.map(tag => <span key={tag} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-400">{tag}</span>)}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
