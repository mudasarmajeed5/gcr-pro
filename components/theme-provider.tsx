"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import applyTheme from '@/lib/utils/theme'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { data: session } = useSession()
  const [isDark, setIsDark] = useState(false)
  const [themeId, setThemeId] = useState<string | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mq.matches)
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches)
    try { mq.addEventListener('change', listener) } catch { mq.addListener(listener) }
    return () => { try { mq.removeEventListener('change', listener) } catch { mq.removeListener(listener) } }
  }, [])

  // apply theme when session or dark mode changes
  useEffect(() => {
    // fetch user's saved settings from server API (safe in any runtime)
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/user-settings')
          if (!res.ok) return
          const data = await res.json()
          if (!mounted) return
          const id = data?.message?.themeId ?? (session as any)?.user?.themeId ?? 'neutral'
          setThemeId(id)
          applyTheme(id, isDark)
        } catch (e) {
          // fallback to session or neutral
          const id = (session as any)?.user?.themeId ?? 'neutral'
          setThemeId(id)
          applyTheme(id, isDark)
        }
      })()
    return () => { mounted = false }
  }, [session, isDark])

  // also reapply when themeId changes (e.g., user changed it in settings)
  useEffect(() => {
    if (!themeId) return
    applyTheme(themeId, isDark)
  }, [themeId, isDark])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
