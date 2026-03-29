'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

export default function ImportPage() {
  const { getToken } = useAuthStore()
  const [collection, setCollection] = useState('items')
  const [json, setJson] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setResult(null); setError(null)
    try {
      const data = JSON.parse(json) as unknown
      const token = getToken()!
      const res = await api.withAuth(token).post<{ inserted: number }>('/admin/import', {
        collection, data: Array.isArray(data) ? data : [data]
      })
      setResult(`✓ ${res.inserted} documentos importados`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao importar')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-4">Importar Dados (JSON)</h1>
      <div className="flex flex-col gap-3">
        <select value={collection} onChange={e => setCollection(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-2">
          {['items', 'monsters', 'skills', 'classes'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea value={json} onChange={e => setJson(e.target.value)} rows={12}
          placeholder='[{"name":"Potion","slug":"potion","type":"consumable",...}]'
          className="bg-gray-700 text-white rounded p-3 font-mono text-sm resize-none" />
        <button onClick={handleImport} className="bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400">
          Importar
        </button>
        {result && <p className="text-green-400 text-sm">{result}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  )
}
