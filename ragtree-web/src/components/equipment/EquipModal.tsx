'use client'
import { useState, useEffect } from 'react'
import { useSkillTreeStore } from '@/store/skill-tree.store'
import { api } from '@/lib/api'
import type { EquipSlot, Item, Enchantment, EquippedItem } from '@/types'

interface Props { slot: EquipSlot; onClose: () => void }

export function EquipModal({ slot, onClose }: Props) {
  const { equipment, setEquipSlot } = useSkillTreeStore()
  const current = equipment[slot]

  const [search, setSearch] = useState('')
  const [latamOnly, setLatamOnly] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedItem, setSelectedItem] = useState<Item | null>(
    current?.item_id && typeof current.item_id !== 'string' ? current.item_id as Item : null
  )
  const [refine, setRefine] = useState(current?.refine ?? 0)
  const [cards, setCards] = useState<(Item | null)[]>([])
  const [cardSearch, setCardSearch] = useState('')
  const [cardResults, setCardResults] = useState<Item[]>([])
  const [editingCardSlot, setEditingCardSlot] = useState<number | null>(null)

  // Fetch items for this slot
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ slot, limit: '100' })
    if (latamOnly) params.set('latam', 'true')
    if (search) params.set('q', search)
    api.get<{ items: Item[] }>(`/items?${params}`).then(d => {
      setItems(d.items.filter(i => i.type !== 'card'))
    }).catch(() => setItems([])).finally(() => setLoading(false))
  }, [slot, search, latamOnly])

  // Init cards when item selected
  useEffect(() => {
    if (selectedItem) {
      const slots = selectedItem.slots ?? 0
      setCards(Array.from({ length: slots }, () => null))
    } else {
      setCards([])
    }
  }, [selectedItem?._id])

  // Search cards
  useEffect(() => {
    if (!cardSearch || editingCardSlot === null) { setCardResults([]); return }
    api.get<{ items: Item[] }>(`/items?type=card&q=${cardSearch}&limit=20`).then(d => {
      setCardResults(d.items)
    }).catch(() => setCardResults([]))
  }, [cardSearch])

  const handleConfirm = () => {
    if (!selectedItem) { onClose(); return }
    const equipped: EquippedItem = {
      item_id: selectedItem,
      refine: selectedItem.refineable ? refine : 0,
      cards: cards.filter((c): c is Item => c !== null),
      enchantments: [],
    }
    setEquipSlot(slot, equipped)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-bold mb-3">Equipar — {slot.replace('_', ' ').toUpperCase()}</h3>

        {/* Search */}
        <div className="flex gap-2 mb-3">
          <input
            type="text" placeholder="Buscar item..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-700 rounded px-3 py-1.5 text-white text-sm"
          />
          <label className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
            <input type="checkbox" checked={latamOnly} onChange={e => setLatamOnly(e.target.checked)} />
            Só LATAM
          </label>
        </div>

        {/* Item list */}
        {!selectedItem && (
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto mb-3">
            {loading && <p className="text-xs text-gray-500 py-2">Carregando...</p>}
            {items.map(item => (
              <button
                key={item._id}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-gray-700 transition-colors"
                onClick={() => { setSelectedItem(item); setRefine(0) }}
              >
                {item.icon_url && <img src={item.icon_url} alt="" className="w-6 h-6 object-contain" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.atk ? `ATK ${item.atk}` : ''}{item.def ? `DEF ${item.def}` : ''} {item.slots ? `• ${item.slots} slots` : ''}
                  </p>
                </div>
              </button>
            ))}
            {!loading && items.length === 0 && <p className="text-xs text-gray-500 py-2">Nenhum item encontrado</p>}
          </div>
        )}

        {/* Selected item config */}
        {selectedItem && (
          <div className="border border-gray-700 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-3">
              {selectedItem.icon_url && <img src={selectedItem.icon_url} alt="" className="w-8 h-8" />}
              <div>
                <p className="text-white font-semibold text-sm">{selectedItem.name}</p>
                <p className="text-[10px] text-gray-500">
                  {selectedItem.atk ? `ATK ${selectedItem.atk} ` : ''}{selectedItem.def ? `DEF ${selectedItem.def} ` : ''}
                  {selectedItem.slots ? `${selectedItem.slots} slots` : ''}
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="ml-auto text-xs text-red-400 hover:text-red-300">Trocar</button>
            </div>

            {/* Refine */}
            {selectedItem.refineable && (
              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1">
                  Refino: <span className="text-yellow-400 font-bold">+{refine}</span>
                  {selectedItem.weapon_level && (
                    <span className="text-gray-600 ml-1">(+{refine * (({ 1: 2, 2: 3, 3: 5, 4: 7 } as Record<number, number>)[selectedItem.weapon_level] ?? 2)} ATK)</span>
                  )}
                </label>
                <input type="range" min={0} max={20} value={refine} onChange={e => setRefine(Number(e.target.value))}
                  className="w-full accent-yellow-500" />
              </div>
            )}

            {/* Cards */}
            {cards.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Cartas ({cards.filter(Boolean).length}/{cards.length})</p>
                <div className="flex gap-2">
                  {cards.map((card, i) => (
                    <button
                      key={i}
                      className="w-10 h-10 rounded border flex items-center justify-center text-[9px]"
                      style={{ borderColor: card ? '#d4a017' : '#555', borderStyle: card ? 'solid' : 'dashed', background: '#0f0f0a' }}
                      onClick={() => { setEditingCardSlot(i); setCardSearch(''); setCardResults([]) }}
                      title={card ? card.name : 'Slot vazio'}
                    >
                      {card?.icon_url ? <img src={card.icon_url} alt="" className="w-7 h-7" /> : <span className="text-gray-600">+</span>}
                    </button>
                  ))}
                </div>
                {editingCardSlot !== null && (
                  <div className="mt-2">
                    <input type="text" placeholder="Buscar carta..." value={cardSearch}
                      onChange={e => setCardSearch(e.target.value)}
                      className="w-full bg-gray-700 rounded px-2 py-1 text-white text-xs mb-1" />
                    <div className="max-h-24 overflow-y-auto flex flex-col gap-0.5">
                      {cardResults.map(c => (
                        <button key={c._id} className="flex items-center gap-1 px-1 py-0.5 hover:bg-gray-700 rounded text-left"
                          onClick={() => {
                            const next = [...cards]; next[editingCardSlot!] = c; setCards(next)
                            setEditingCardSlot(null); setCardSearch('')
                          }}>
                          {c.icon_url && <img src={c.icon_url} alt="" className="w-5 h-5" />}
                          <span className="text-xs text-white truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded text-sm hover:bg-gray-600">Cancelar</button>
          <button onClick={handleConfirm} className="flex-1 bg-yellow-500 text-gray-900 font-semibold py-2 rounded text-sm hover:bg-yellow-400">
            {selectedItem ? 'Equipar' : 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  )
}
