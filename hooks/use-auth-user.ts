// hooks/useAuthuser.js
"use client"
import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function useAuthUser() {
  const { status } = useSession()
  const authuserId = useAuthStore((state) => state.authuserId)
  const fetchAuthuser = useAuthStore((state) => state.fetchAuthuser)
  
  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    if (!authuserId) {
      fetchAuthuser()
    }
  }, [fetchAuthuser, authuserId, status])
  
  return authuserId
}