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
    <section className="py-10 px-4" style={{ background: '#0a0a0f', borderBottom: '1px solid #1a1a0a' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-baseline mb-4">
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: '#d4a017' }}>
            Builds em Destaque
          </p>
          <Link href="/builds" className="text-xs transition-opacity hover:opacity-70" style={{ color: '#666' }}>
            Ver todas →
          </Link>
        </div>

        {/* Filter pills */}
        {classesWithBuilds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setActive(null)}
              className="px-3 py-1 text-xs transition-colors"
              style={active === null
                ? { background: '#d4a017', color: '#000', fontWeight: 'bold' }
                : { border: '1px solid #2a2a10', color: '#888' }}
            >
              Todas
            </button>
            {classesWithBuilds.map(cls => (
              <button
                key={cls._id}
                onClick={() => setActive(active === String(cls._id) ? null : String(cls._id))}
                className="px-3 py-1 text-xs transition-colors"
                style={active === String(cls._id)
                  ? { background: '#d4a017', color: '#000', fontWeight: 'bold' }
                  : { border: '1px solid #2a2a10', color: '#888' }}
              >
                {cls.icon_url} {cls.name}
              </button>
            ))}
          </div>
        )}

        {/* Build list */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: '#555' }}>
              Nenhuma build para esta classe ainda
            </p>
          )}
          {filtered.map((build, i) => (
            <Link
              key={build._id}
              href={`/builds/${build._id}`}
              className="flex justify-between items-center px-4 py-3 transition-opacity hover:opacity-80"
              style={{
                background: '#0f1208',
                borderLeft: `2px solid ${i === 0 ? '#d4a017' : '#555'}`,
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: i === 0 ? '#f5e6a3' : '#ccc' }}>
                  {typeof build.class_id === 'object' ? build.class_id.icon_url : ''} {build.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                  {typeof build.class_id === 'object' ? build.class_id.name : ''} • {build.views} views
                </p>
              </div>
              <span className="text-xs ml-4 shrink-0" style={{ color: i === 0 ? '#d4a017' : '#666' }}>
                #{i + 1}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
