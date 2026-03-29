import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { AdSenseScript } from '@/components/layout/AdBanner'
import { AuthProvider } from '@/components/providers/AuthProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RagTree — Simulador de Builds Ragnarok LATAM',
  description: 'Simule builds, árvores de skills e veja os melhores equipamentos do Ragnarok Online LATAM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
        <AdSenseScript />
      </body>
    </html>
  )
}
