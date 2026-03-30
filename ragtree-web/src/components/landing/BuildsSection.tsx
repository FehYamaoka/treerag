'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Build, Class } from '@/types'

export function BuildsSection({ builds, classes }: { builds: Build[]; classes: Class[] }) {
  const [active, setActive] = useState<string | null>(null)

  const classesWithBuilds = classes.filter(cls =>
    builds.some(b => {
      const id = typeof b.class_id === 'object' ? b.class_id._id : b.class_id
      return String(id) === String(cls._id)
    })
  )

  const filtered = active
    ? builds.filter(b => {
        const id = typeof b.class_id === 'object' ? b.class_id._id : b.class_id
        return String(id) === active
      })
    : builds

  return (
    <section className="flex-1 px-4 py-3 overflow-hidden" style={{ background: '#0a0a0f' }}>
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#d4a017' }}>Builds em Destaque</p>
          <Link href="/builds" className="text-[10px] ml-auto hover:opacity-70" style={{ color: '#555' }}>Ver todas</Link>
        </div>

        {classesWithBuilds.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            <button onClick={() => setActive(null)} className="px-2 py-0.5 text-[10px] rounded"
              style={active === null ? { background: '#d4a017', color: '#000', fontWeight: 'bold' } : { color: '#666' }}>
              Todas
            </button>
            {classesWithBuilds.map(cls => (
              <button key={cls._id} onClick={() => setActive(active === String(cls._id) ? null : String(cls._id))}
                className="px-2 py-0.5 text-[10px] rounded"
                style={active === String(cls._id) ? { background: '#d4a017', color: '#000', fontWeight: 'bold' } : { color: '#666' }}>
                {cls.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 overflow-y-auto flex-1">
          {filtered.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: '#444' }}>Nenhuma build ainda</p>
          )}
          {filtered.map((build, i) => (
            <Link key={build._id} href={`/builds/${build._id}`}
              className="flex justify-between items-center px-3 py-2 rounded transition-opacity hover:opacity-80"
              style={{ background: '#0f1208', borderLeft: `2px solid ${i === 0 ? '#d4a017' : '#333'}` }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: i === 0 ? '#f5e6a3' : '#ccc' }}>
                  {typeof build.class_id === 'object' ? build.class_id.icon_url ? '' : '' : ''} {build.title}
                </p>
                <p className="text-[10px]" style={{ color: '#444' }}>
                  {typeof build.class_id === 'object' ? build.class_id.name : ''} • {build.views} views
                </p>
              </div>
              <span className="text-[10px] ml-2" style={{ color: i === 0 ? '#d4a017' : '#555' }}>#{i + 1}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
