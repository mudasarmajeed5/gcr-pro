"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import applyTheme from '@/lib/utils/theme'

// A small component inside the provider that reacts to next-themes' resolvedTheme
// and re-applies CSS variables for the selected color palette (themeId).
function ThemeApplier() {
  const { resolvedTheme } = useTheme()
  const { data: session, status } = useSession()
  const [themeId, setThemeId] = useState<string | null>(null)
  const [hasCheckedTheme, setHasCheckedTheme] = useState(false)

  // Function to fetch and apply theme from database
  const fetchAndApplyTheme = async () => {
    let mounted = true
    try {
      const res = await fetch('/api/user-settings')
      if (!res.ok) return
      const data = await res.json()
      if (!mounted) return
      const msg = data?.message as unknown as { themeId?: string }
      const id = msg?.themeId ?? 'neutral'

      // Only apply if it's not neutral (user has a custom theme)
      if (id !== 'neutral') {
        setThemeId(id)
        applyTheme(id, resolvedTheme === 'dark')
        // Set cookie for future use
        document.cookie = `themeId=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 30}`
      }
    } catch {
      if (!mounted) return
      // Fallback to neutral only if no theme is set
      if (!themeId) {
        setThemeId('neutral')
        applyTheme('neutral', resolvedTheme === 'dark')
      }
    }
    return () => { mounted = false }
  }

  // Check for theme immediately on login
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !hasCheckedTheme) {
      setHasCheckedTheme(true)
      fetchAndApplyTheme()
      return
    }

    // Reset flag on logout
    if (status === 'unauthenticated') {
      setHasCheckedTheme(false)
      setThemeId(null)
    }
  }, [status, session, hasCheckedTheme])

  // Load themeId fast-path from cookie, fallback to server API
  useEffect(() => {
    // Skip if we already checked after login
    if (hasCheckedTheme || themeId) return

    const cookieMatch = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )themeId=([^;]+)/) : null
    const cookieThemeId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
    if (cookieThemeId && cookieThemeId !== 'neutral') {
      setThemeId(cookieThemeId)
      applyTheme(cookieThemeId, resolvedTheme === 'dark')
      return
    }

    // Only fetch if user is authenticated and we haven't checked yet
    if (status === 'authenticated' && !hasCheckedTheme) {
      fetchAndApplyTheme()
    }
  }, [resolvedTheme, themeId, status, hasCheckedTheme])

  // reapply whenever the resolvedTheme (light/dark) or themeId changes
  useEffect(() => {
    if (!themeId) return
    applyTheme(themeId, resolvedTheme === 'dark')
  }, [themeId, resolvedTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeApplier />
      {children}
    </NextThemesProvider>
  )
}
