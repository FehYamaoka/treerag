import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Build } from '@/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Builds para ${slug} — RagTree` }
}

export default async function ClassBuildsPage({ params }: Props) {
  const { slug } = await params
  const data = await api.get<{ builds: Build[] }>(`/builds?class=${slug}&sort=views&limit=30`).catch(() => ({ builds: [] as Build[] }))

  return (
    <div>
      <Link href={`/classes/${slug}`} className="text-yellow-400 hover:underline text-sm mb-4 inline-block">← Voltar</Link>
      <h1 className="text-2xl font-bold text-white mb-6">Builds para {slug}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.builds.map(build => (
          <Link key={build._id} href={`/builds/${build._id}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-colors">
            <p className="font-semibold text-white">{build.title}</p>
            <p className="text-sm text-gray-400 mt-1">♥ {build.likes} • 👁 {build.views}</p>
          </Link>
        ))}
        {data.builds.length === 0 && <p className="text-gray-400 col-span-3">Nenhuma build ainda.</p>}
      </div>
    </div>
  )
}
