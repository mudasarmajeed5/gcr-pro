"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import DashboardSidebar from "@/components/DashboardSidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelRight } from "lucide-react"
import { MaterialPreviewModal } from "@/components/material-preview-modal"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" side="left">
      <SidebarContent>
        <DashboardSidebar />
      </SidebarContent>
    </Sidebar>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  if (isMobile) {
    return (
      <SidebarProvider defaultOpen={false}>
        <MaterialPreviewModal />
        <AppSidebar />
        <main className="flex-1">
          <Header />
          <div className="h-[calc(100vh-70px)]">
            <div className="h-full overflow-auto relative">
              <SidebarTrigger className="absolute top-2 left-2 z-50" />
              {children}
            </div>
          </div>
        </main>
      </SidebarProvider>
    )
  }

  return (
    <>
      <main>
        <MaterialPreviewModal />
        <Header />
        <div className="h-[calc(100vh-70px)]">
          <ResizablePanelGroup direction="horizontal">
            {/* Sidebar Panel - Always present but conditionally sized */}
            <ResizablePanel
              defaultSize={sidebarOpen ? 20 : 0}
              minSize={sidebarOpen ? 20 : 0}
              maxSize={sidebarOpen ? 40 : 0}
              className="relative border-r"
            >
              <div className={`h-full ${sidebarOpen ? 'block' : 'hidden'}`}>
                <DashboardSidebar />
                
                {/* Toggle button when sidebar is open */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-2 right-2 z-30"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle className={sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} />

            {/* Main Content Panel */}
            <ResizablePanel 
              defaultSize={sidebarOpen ? 80 : 100}
              className="relative"
            >
              <div className="h-full overflow-auto">
                {children}
              </div>

              {/* Toggle button when sidebar is closed */}
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="absolute top-2 left-2 z-50"
                >
                  <PanelRight className="h-5 w-5" />
                </Button>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}