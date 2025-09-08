/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,  
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState, useEffect } from "react"

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    console.log('PWA Install Button: Component mounted')
    
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA Install Button: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    console.log('PWA Install Button: Is standalone mode?', isStandalone)
    
    if (isStandalone) {
      setShowInstall(false)
      console.log('PWA Install Button: Already installed, hiding button')
    }

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('PWA Install Button: Service worker is ready')
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('PWA Install Button: Install button clicked')
    if (!deferredPrompt) {
      console.log('PWA Install Button: No deferred prompt available')
      return
    }

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    console.log('PWA Install Button: User choice:', choiceResult.outcome)
    
    setDeferredPrompt(null)
    setShowInstall(false)
  }

  console.log('PWA Install Button: Render - showInstall:', showInstall, 'deferredPrompt:', !!deferredPrompt)

  if (!showInstall) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="size-9 rounded-full"
            onClick={handleInstallClick}
          >
            <Download className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Install App</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}