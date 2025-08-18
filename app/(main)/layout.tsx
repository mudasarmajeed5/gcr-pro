import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardSidebar from "@/components/DashboardSidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <Header />
            <div className="h-[calc(100vh-70px)]">
                <ResizablePanelGroup
                    direction="horizontal"
                >
                    <ResizablePanel 
                        defaultSize={20} 
                        minSize={15} 
                        maxSize={30}
                        className="border-r"
                    >
                        <DashboardSidebar />
                    </ResizablePanel>
                    
                    <ResizableHandle withHandle />
                    
                    <ResizablePanel defaultSize={80}>
                        <div className="h-full overflow-auto">
                            {children}
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </main>
    )
}