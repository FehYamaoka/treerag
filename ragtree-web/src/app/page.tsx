import Link from 'next/link'
import { api } from '@/lib/api'
import type { Class, Build } from '@/types'
import { AdBanner } from '@/components/layout/AdBanner'

async function getData() {
  const [classes, buildsData] = await Promise.all([
    api.get<Class[]>('/classes').catch(() => [] as Class[]),
    api.get<{ builds: Build[] }>('/builds?limit=6&sort=views').catch(() => ({ builds: [] as Build[] }))
  ])
  return { classes, builds: buildsData.builds }
}

export default async function HomePage() {
  const { classes, builds } = await getData()

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-3">RagTree</h1>
        <p className="text-gray-400 text-lg">Simule builds, árvores de skills e explore itens do Ragnarok LATAM</p>
      </section>

      <AdBanner slot="1234567890" format="horizontal" className="my-4" />

      {/* Classes */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Classes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {classes.map(cls => (
            <Link key={cls._id} href={`/classes/${cls.slug}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center transition-colors">
              {cls.icon_url && <img src={cls.icon_url} alt={cls.name} className="w-10 h-10 mx-auto mb-1" />}
              <p className="text-sm text-gray-200">{cls.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Builds */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Builds em Destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {builds.map(build => (
            <Link key={build._id} href={`/builds/${build._id}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors">
              <p className="font-semibold text-white">{build.title}</p>
              <p className="text-sm text-gray-400 mt-1">
                {typeof build.class_id === 'object' ? build.class_id.name : ''} • {build.views} views
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
