import Link from 'next/link'
import type { Class } from '@/types'

export function ClassesSection({ classes }: { classes: Class[] }) {
  return (
    <section className="py-10 px-4" style={{ background: '#0d0e08', borderBottom: '1px solid #1a1a0a' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-baseline mb-6">
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: '#d4a017' }}>
            Classes de Midgard
          </p>
          <Link href="/classes" className="text-xs transition-opacity hover:opacity-70" style={{ color: '#666' }}>
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {classes.map(cls => (
            <Link
              key={cls._id}
              href={`/classes/${cls.slug}`}
              className="p-2 text-center transition-colors hover:opacity-80"
              style={{ background: '#111409', border: '1px solid #2a2a10' }}
            >
              <div className="text-2xl mb-1">{cls.icon_url}</div>
              <p className="text-xs font-medium truncate" style={{ color: '#d4a017' }}>{cls.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
