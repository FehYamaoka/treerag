'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import type { User } from '@/types'

function CallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { router.replace('/login'); return }
    api.withAuth(token).get<User>('/users/me')
      .then(user => { setAuth(user, token); router.replace('/dashboard') })
      .catch(() => router.replace('/login'))
  }, [])

  return <p className="text-center mt-20 text-gray-400">Autenticando...</p>
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-gray-400">Carregando...</p>}>
      <CallbackContent />
    </Suspense>
  )
}
