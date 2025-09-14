// store/authStore.ts
import { create } from 'zustand'

interface AuthStore {
  authuser: number | null
  setAuthuser: (authuser: number | null) => void
  fetchAuthuser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  authuser: null,

  setAuthuser: (authuser) => set({ authuser }),

  fetchAuthuser: async () => {
    try {
      const res = await fetch('/api/auth/authuser')
      const data: { authuser: number | null } = await res.json()
      if (data.authuser !== null) {
        set({ authuser: data.authuser })
      }
    } catch (error) {
      console.error('Failed to fetch authuser:', error)
    }
  },
}))
