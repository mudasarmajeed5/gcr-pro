// hooks/useAuthuser.js
"use client"
import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'

export default function useAuthUser() {
  const authuserId = useAuthStore((state) => state.authuserId)
  const fetchAuthuser = useAuthStore((state) => state.fetchAuthuser)
  
  useEffect(() => {
    if (!authuserId) {
      fetchAuthuser()
    }
  }, [fetchAuthuser, authuserId])
  
  return authuserId
}