'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password })
      setAuth(data.user, data.access_token)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Entrar</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required />
        <button type="submit" disabled={loading}
          className="bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="flex flex-col gap-2">
          <a href={`${apiUrl}/auth/google`}
            className="bg-white text-gray-900 text-center py-2 rounded font-medium hover:bg-gray-100">
            Entrar com Google
          </a>
          <a href={`${apiUrl}/auth/discord`}
            className="bg-indigo-600 text-white text-center py-2 rounded font-medium hover:bg-indigo-500">
            Entrar com Discord
          </a>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Não tem conta? <Link href="/register" className="text-yellow-400 hover:underline">Cadastre-se</Link>
        </p>
      </form>
    </div>
  )
}
