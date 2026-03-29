import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Item } from '@/types'

export const revalidate = 3600

interface ItemWithDrops extends Item {
  drop_sources: Array<{ monster_id: { name: string; slug: string }; rate: number }>
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await api.get<Item>(`/items/${slug}`).catch(() => null)
  if (!item) return { title: 'Item não encontrado' }
  return { title: `${item.name} — RagTree`, description: `Stats e onde dropar ${item.name} no Ragnarok LATAM` }
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params
  const item = await api.get<ItemWithDrops>(`/items/${slug}`).catch(() => null)
  if (!item) notFound()

  const stats = [
    item.atk ? `ATK: ${item.atk}` : null,
    item.def ? `DEF: ${item.def}` : null,
    item.weight ? `Peso: ${item.weight}` : null,
    item.slots !== undefined ? `Slots: ${item.slots}` : null,
    item.required_level ? `Lv. mín: ${item.required_level}` : null,
  ].filter((s): s is string => Boolean(s))

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        {item.icon_url && <img src={item.icon_url} alt={item.name} className="w-16 h-16" />}
        <div>
          <h1 className="text-2xl font-bold text-white">{item.name}</h1>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded capitalize">{item.type}</span>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-sm text-gray-400 mb-2">Atributos</h2>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(s => <p key={s} className="text-sm text-white">{s}</p>)}
          </div>
        </div>
      )}

      {item.drop_sources?.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm text-gray-400 mb-2">Onde dropar</h2>
          {item.drop_sources.map(ds => (
            <a key={ds.monster_id.slug} href={`/monsters/${ds.monster_id.slug}`}
              className="flex justify-between text-sm hover:text-yellow-400 py-1">
              <span>{ds.monster_id.name}</span>
              <span className="text-gray-500">{(ds.rate / 100).toFixed(2)}%</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
