// hooks/useAuthuser.js
"use client"
import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'

export default function useAuthUser() {
  const authuser = useAuthStore((state) => state.authuser)
  const fetchAuthuser = useAuthStore((state) => state.fetchAuthuser)
  
  useEffect(() => {
    if (!authuser) {
      fetchAuthuser()
    }
  }, [fetchAuthuser, authuser])
  
  return authuser
}