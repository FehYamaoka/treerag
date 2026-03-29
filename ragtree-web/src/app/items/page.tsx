import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Item } from '@/types'
import { AdBanner } from '@/components/layout/AdBanner'

export const metadata: Metadata = {
  title: 'Itens — RagTree',
  description: 'Banco de itens completo do Ragnarok Online LATAM'
}

interface Props { searchParams: Promise<{ type?: string; q?: string; page?: string }> }

export default async function ItemsPage({ searchParams }: Props) {
  const { type, q, page = '1' } = await searchParams
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (q) params.set('q', q)
  params.set('page', page)
  params.set('limit', '30')

  const data = await api.get<{ items: Item[]; total: number }>(`/items?${params}`).catch(() => ({ items: [] as Item[], total: 0 }))

  const types = ['weapon', 'armor', 'card', 'consumable', 'misc']

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Itens</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <Link href="/items" className={`px-3 py-1 rounded text-sm ${!type ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
          Todos
        </Link>
        {types.map(t => (
          <Link key={t} href={`/items?type=${t}`}
            className={`px-3 py-1 rounded text-sm capitalize ${type === t ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            {t}
          </Link>
        ))}
      </div>

      <AdBanner slot="1122334455" format="horizontal" className="mb-6" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.items.map(item => (
          <Link key={item._id} href={`/items/${item.slug}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors">
            {item.icon_url && <img src={item.icon_url} alt={item.name} className="w-12 h-12" />}
            <p className="text-xs text-center text-gray-200">{item.name}</p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-4">Total: {data.total} itens</p>
    </div>
  )
}
