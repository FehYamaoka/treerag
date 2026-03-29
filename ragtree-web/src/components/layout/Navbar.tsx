'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-yellow-400 font-bold text-xl tracking-wide">
        RagTree
      </Link>
      <div className="flex items-center gap-6 text-sm text-gray-300">
        <Link href="/classes" className="hover:text-yellow-400 transition-colors">Classes</Link>
        <Link href="/items" className="hover:text-yellow-400 transition-colors">Itens</Link>
        <Link href="/builds" className="hover:text-yellow-400 transition-colors">Builds</Link>
        {isAuthenticated() ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hover:text-yellow-400">{user?.name}</Link>
            <button onClick={logout} className="text-red-400 hover:text-red-300">Sair</button>
          </div>
        ) : (
          <Link href="/login" className="bg-yellow-500 text-gray-900 px-3 py-1 rounded font-semibold hover:bg-yellow-400">
            Entrar
          </Link>
        )}
      </div>
    </nav>
  )
}
