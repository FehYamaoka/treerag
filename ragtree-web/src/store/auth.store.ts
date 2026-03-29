import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  getToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        api.post('/auth/logout', {})
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
      getToken: () => get().token,
    }),
    { name: 'ragtree-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
)
