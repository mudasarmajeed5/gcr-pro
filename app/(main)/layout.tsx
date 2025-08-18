"use client"

import { useState } from "react"
import Header from "@/components/Header"
import DashboardSidebar from "@/components/DashboardSidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelRight } from "lucide-react"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <main>
      <Header />
      <div className="h-[calc(100vh-70px)] relative">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          {sidebarOpen && (
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className="relative border-r transition-all duration-300 ease-in-out"
            >
              <DashboardSidebar />

              {/* Toggle button, stuck to sidebar's right edge */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-2 right-2 z-50"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            </ResizablePanel>
          )}

          {sidebarOpen && <ResizableHandle withHandle />}

          {/* Main Content */}
          <ResizablePanel defaultSize={sidebarOpen ? 80 : 100} className="relative">
            <div className="h-full overflow-auto transition-all duration-300 ease-in-out">
              {children}
            </div>

            {/* When sidebar is closed, show button on left edge of main */}
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
  )
}
