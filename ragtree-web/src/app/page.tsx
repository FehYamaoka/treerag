import { api } from '@/lib/api'
import type { Class, Build } from '@/types'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ClassesSection } from '@/components/landing/ClassesSection'
import { BuildsSection } from '@/components/landing/BuildsSection'

async function getData() {
  const [classes, buildsData] = await Promise.all([
    api.get<Class[]>('/classes').catch(() => [] as Class[]),
    api.get<{ builds: Build[] }>('/builds?limit=6&sort=views').catch(() => ({ builds: [] as Build[] })),
  ])
  return { classes, builds: buildsData.builds }
}

export default async function HomePage() {
  const { classes, builds } = await getData()
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ClassesSection classes={classes} />
      <BuildsSection builds={builds} classes={classes} />
    </div>
  )
}
