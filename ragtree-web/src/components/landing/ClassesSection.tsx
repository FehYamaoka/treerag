'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Class } from '@/types'

const TIERS = [
  { label: 'Todas', filter: () => true },
  { label: '1st', filter: (c: Class) => [10, 50].includes(c.job_level_max) && !c.parent_class_id?.length },
  { label: '2nd', filter: (c: Class) => c.job_level_max === 50 && !!c.parent_class_id },
  { label: 'Trans', filter: (c: Class) => c.job_level_max === 70 },
  { label: '3rd+', filter: (c: Class) => c.job_level_max === 60 },
]

export function ClassesSection({ classes }: { classes: Class[] }) {
  const [tier, setTier] = useState(0)
  const filtered = classes.filter(TIERS[tier].filter)

  return (
    <section className="flex-1 px-4 py-3 overflow-hidden" style={{ background: '#0d0e08', borderTop: '1px solid #1a1a0a', borderBottom: '1px solid #1a1a0a' }}>
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#d4a017' }}>Classes</p>
          <div className="flex gap-1 ml-auto">
            {TIERS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setTier(i)}
                className="px-2 py-0.5 text-[10px] rounded transition-colors"
                style={tier === i ? { background: '#d4a017', color: '#000', fontWeight: 'bold' } : { color: '#666' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 overflow-y-auto flex-1">
          {filtered.map(cls => (
            <Link
              key={cls._id}
              href={`/classes/${cls.slug}`}
              className="p-1.5 text-center transition-opacity hover:opacity-80 rounded"
              style={{ background: '#111409', border: '1px solid #2a2a10' }}
            >
              {cls.icon_url ? (
                <img src={cls.icon_url} alt={cls.name} className="w-8 h-8 mx-auto mb-0.5 object-contain" />
              ) : (
                <div className="w-8 h-8 mx-auto mb-0.5 bg-gray-800 rounded" />
              )}
              <p className="text-[10px] font-medium truncate" style={{ color: '#d4a017' }}>{cls.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
