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
