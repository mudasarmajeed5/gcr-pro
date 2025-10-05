"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useEffect, useState } from 'react'
import applyTheme from '@/lib/utils/theme'

// A small component inside the provider that reacts to next-themes' resolvedTheme
// and re-applies CSS variables for the selected color palette (themeId).
function ThemeApplier() {
  const { resolvedTheme } = useTheme()
  const [themeId, setThemeId] = useState<string | null>(null)

  // Load themeId fast-path from cookie, fallback to server API
  useEffect(() => {
    // Only run this fetch/apply once if we don't already have a themeId.
    if (themeId) return

    const cookieMatch = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )themeId=([^;]+)/) : null
    const cookieThemeId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
    if (cookieThemeId) {
      setThemeId(cookieThemeId)
      // we rely on the resolvedTheme to decide dark vs light
      applyTheme(cookieThemeId, resolvedTheme === 'dark')
      return
    }

    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/user-settings')
          if (!res.ok) return
          const data = await res.json()
          if (!mounted) return
          const msg = data?.message as unknown as { themeId?: string }
          const id = msg?.themeId ?? 'neutral'
          setThemeId(id)
          applyTheme(id, resolvedTheme === 'dark')
        } catch {
          if (!mounted) return
          setThemeId('neutral')
          applyTheme('neutral', resolvedTheme === 'dark')
        }
      })()
    return () => { mounted = false }
  }, [resolvedTheme, themeId])

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
