'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api.post<{ access_token: string; user: User }>('/auth/register', { name, email, password })
      setAuth(data.user, data.access_token)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Criar Conta</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required minLength={2} />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required />
        <input type="password" placeholder="Senha (mín. 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 text-white" required minLength={8} />
        <button type="submit" disabled={loading}
          className="bg-yellow-500 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50">
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>
        <p className="text-sm text-gray-400 text-center">
          Já tem conta? <Link href="/login" className="text-yellow-400 hover:underline">Entrar</Link>
        </p>
      </form>
    </div>
  )
}
