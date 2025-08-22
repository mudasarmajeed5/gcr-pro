import { create } from 'zustand'

type Store = {
  smtpPassword: string | null,
  showGradeCard: boolean | false,
  setSmtpPassword: (password: string) => void;
  setShowGradeCard: (value: boolean) => void;
}

export const userStore = create<Store>()((set) => ({
  smtpPassword: null,
  showGradeCard: false,
  setSmtpPassword(password) {
    set({ smtpPassword: password })
  },
  setShowGradeCard(value: boolean) {
    set({ showGradeCard: value });
  },
}))
