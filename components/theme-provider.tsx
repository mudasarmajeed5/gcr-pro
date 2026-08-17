"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { THEMES } from '@/constants/themes'
import applyTheme from '@/lib/utils/theme'

// A small component inside the provider that reacts to next-themes' resolvedTheme
// and re-applies CSS variables for the selected color palette (themeId).
function ThemeApplier() {
  const { resolvedTheme } = useTheme()
  const { data: session, status } = useSession()
  const [themeId, setThemeId] = useState<string>('neutral')

  // Fetch the saved theme once the user is authenticated and apply it.
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user-settings')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const msg = data?.message as { themeId?: string } | undefined
        const id = msg?.themeId
        if (id && id in THEMES) {
          setThemeId(id)
          document.cookie = `themeId=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 30}`
        }
      } catch {
        // Fall back to the default (neutral) theme.
      }
    })()
    return () => { cancelled = true }
  }, [status, session?.user])

  // When logged out, fall back to the themeId cookie if one exists.
  useEffect(() => {
    if (status === 'authenticated') return
    const cookieMatch = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )themeId=([^;]+)/) : null
    const cookieThemeId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
    if (cookieThemeId && cookieThemeId in THEMES) {
      setThemeId(cookieThemeId)
    }
  }, [status])

  // Apply the CSS variables whenever the palette or light/dark mode changes.
  // This always runs (even for the default neutral palette) so toggling
  // light/dark correctly overwrites any inline variables set on first paint.
  useEffect(() => {
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
