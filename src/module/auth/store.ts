import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type User = Record<string, unknown>

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
      logout: () => {
        set({ user: null, token: null })
        // TODO: Clear all stores
        localStorage.clear()
      },
      isAuthenticated: () => {
        const state = get()
        return !!state.token
      },
    }),
    {
      name: 'auth-storage', // storage key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
)
