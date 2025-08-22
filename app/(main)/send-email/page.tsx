'use client'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import ProfessorList from './ProfessorsList'
import EmailComposer from './EmailComposer'
import { useEffect, useState } from 'react'
import { getAllProfessors } from './actions/get-professor-details'
import { RefreshCw } from 'lucide-react'

interface Professor {
  id: string
  name: string
  email: string
  courseName: string
  avatar?: string
}

export default function SendEmail() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)

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


  if (loading) return <p className="text-center h-full py-4 flex justify-center gap-4 items-center">Loading... <RefreshCw className="animate-spin size-5"/> </p>

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
      <ResizablePanel defaultSize={70}>
        <EmailComposer selectedProfessor={selectedProfessor} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={30} minSize={25}>
        <ProfessorList
          professors={professors}
          selectedProfessor={selectedProfessor}
          onSelectProfessor={setSelectedProfessor}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
