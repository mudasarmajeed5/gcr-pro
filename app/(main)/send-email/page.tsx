'use client'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { PanelLeft, PanelRight } from 'lucide-react'
import ProfessorList from './ProfessorsList'
import EmailComposer from './EmailComposer'
import { useEffect, useState } from 'react'
import { getAllProfessors } from './actions/get-professor-details'
import UILoading from '@/components/UILoading'
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface Professor {
  id: string
  name: string
  email: string
  courseName: string
  avatar?: string
}

function ProfessorSidebar({ professors, selectedProfessor, onSelectProfessor }: {
  professors: Professor[]
  selectedProfessor: Professor | null
  onSelectProfessor: (prof: Professor | null) => void
}) {
  return (
    <Sidebar collapsible="offcanvas" side="right">
      <SidebarContent>
        <ProfessorList
          professors={professors}
          selectedProfessor={selectedProfessor}
          onSelectProfessor={onSelectProfessor}
        />
      </SidebarContent>
    </Sidebar>
  )
}

export default function SendEmail() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [professorListOpen, setProfessorListOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const cached = sessionStorage.getItem('professors')
    if (cached) {
      setProfessors(JSON.parse(cached))
      setLoading(false)
      return
    }

    const fetchProfessors = async () => {
      try {
        const data = await getAllProfessors()

        if (Array.isArray(data)) {
          setProfessors(data)
          sessionStorage.setItem('professors', JSON.stringify(data))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfessors()
  }, [])

  if (loading) return <UILoading/>

  if (isMobile) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex-1">
          <div className="min-h-[500px] rounded-lg border relative">
            <EmailComposer selectedProfessor={selectedProfessor} />
            <SidebarTrigger className="absolute top-2 right-2 z-50" />
          </div>
        </div>
        <ProfessorSidebar 
          professors={professors}
          selectedProfessor={selectedProfessor}
          onSelectProfessor={setSelectedProfessor}
        />
      </SidebarProvider>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
      <ResizablePanel 
        defaultSize={professorListOpen ? 60 : 100}
        className="relative"
      >
        <EmailComposer selectedProfessor={selectedProfessor} />
        
        {/* Toggle button when professor list is closed */}
        {!professorListOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setProfessorListOpen(true)}
            className="absolute top-2 right-2 z-50"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
      </ResizablePanel>

      {professorListOpen && (
        <>
          <ResizableHandle withHandle />
          
          <ResizablePanel 
            defaultSize={30} 
            minSize={25}
            maxSize={40}
            className="relative"
          >
            <ProfessorList
              professors={professors}
              selectedProfessor={selectedProfessor}
              onSelectProfessor={setSelectedProfessor}
            />
            
            {/* Toggle button when professor list is open */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProfessorListOpen(false)}
              className="absolute top-2 right-2 z-30"
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}