import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/lib/api'
import type { Class } from '@/types'

export const metadata: Metadata = {
  title: 'Classes — RagTree',
  description: 'Todas as classes do Ragnarok Online LATAM com árvore de skills'
}

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
  const classes = await api.get<Class[]>('/classes').catch(() => [] as Class[])

  const baseClasses = classes.filter(c => !c.parent_class_id)
  const advancedClasses = classes.filter(c => c.parent_class_id)

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-8">Classes</h1>

      <section className="mb-10">
        <h2 className="text-lg text-gray-400 mb-4">Classes Base</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {baseClasses.map(cls => (
            <Link key={cls._id} href={`/classes/${cls.slug}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
              {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-14 h-14" />}
              <p className="font-semibold text-white text-center">{cls.name}</p>
              <p className="text-xs text-gray-500">Job Lv {cls.job_level_max}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg text-gray-400 mb-4">Classes Avançadas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {advancedClasses.map(cls => (
            <Link key={cls._id} href={`/classes/${cls.slug}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
              {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-14 h-14" />}
              <p className="font-semibold text-white text-center">{cls.name}</p>
              <p className="text-xs text-gray-500">Job Lv {cls.job_level_max}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
