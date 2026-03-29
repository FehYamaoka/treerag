'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout } = useAuthStore()

  useEffect(() => {
    if (token) {
      api.post<{ access_token: string }>('/auth/refresh', {})
        .then(data => {
          const { user } = useAuthStore.getState()
          if (user) setAuth(user, data.access_token)
        })
        .catch(() => logout())
    }
  }, [])

  return <>{children}</>
}
