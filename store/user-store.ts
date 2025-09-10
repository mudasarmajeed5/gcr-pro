import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Store = {
  smtpPassword: string | null
  showGradeCard: boolean
  isLoaded: boolean
  setSmtpPassword: (password: string) => void
  setShowGradeCard: (value: boolean) => void
  setIsLoaded: (value: boolean) => void
}

export const userStore = create<Store>()(
  persist(
    (set) => ({
      smtpPassword: null,
      isLoaded: false,
      showGradeCard: false,
      setSmtpPassword(password) {
        set({ smtpPassword: password })
      },
      setShowGradeCard(value: boolean) {
        set({ showGradeCard: value })
      },
      setIsLoaded(value: boolean) {
        set({ isLoaded: value })
      },
    }),
    {
      name: 'user-storage',
    }
  )
)
