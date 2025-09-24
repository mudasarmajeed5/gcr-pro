// store/authStore.ts
import { create } from 'zustand'

interface AuthStore {
  authuserId: number
  setAuthuser: (authuser: number) => void
  fetchAuthuser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  authuserId: 0,

  setAuthuser: (authuserId) => set({ authuserId }),

  fetchAuthuser: async () => {
    try {
      const res = await fetch('/api/auth/authuser')
      const data: { authUserId: number } = await res.json()
      set({ authuserId: data.authUserId })
    } catch (error) {
      console.error('Failed to fetch authuser:', error)
    }
  },
}))
