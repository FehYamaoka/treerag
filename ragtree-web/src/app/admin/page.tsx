'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated() || !['admin', 'collaborator'].includes(user?.role || '')) {
      router.replace('/')
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <Link href="/admin/users" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-white">
          <p className="font-semibold">Usuários</p>
          <p className="text-sm text-gray-400">Gerenciar roles</p>
        </Link>
        <Link href="/admin/import" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-white">
          <p className="font-semibold">Importar Dados</p>
          <p className="text-sm text-gray-400">JSON para classes, skills, itens</p>
        </Link>
      </div>
    </div>
  )
}
