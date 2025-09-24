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
    
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
      setShowInstall(false)
    }

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    
    setDeferredPrompt(null)
    setShowInstall(false)
  }


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