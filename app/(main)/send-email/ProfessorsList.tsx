'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Professor {
  id: string
  name: string
  email: string
  courseName: string
  avatar?: string
}

interface ProfessorListProps {
  professors: Professor[]
  selectedProfessor: Professor | null
  onSelectProfessor: (prof: Professor) => void
}

export default function ProfessorList({ professors, selectedProfessor, onSelectProfessor }: ProfessorListProps) {
  if (!professors.length) return <p className="text-center py-4">No professors found.</p>
  const uniqueProfessors = professors.reduce((acc, prof) => {
    if (!acc.find(p => p.id === prof.id)) {
      acc.push(prof);
    }
    return acc;
  }, [] as typeof professors)
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 m-2">
        <h2 className="text-lg sticky z-2 px-4 py-2 top-1 dark:bg-black bg-gray-100 rounded-full font-semibold">
          Professors
        </h2>
        {uniqueProfessors.map((prof, idx) => (
          <Card
            key={`${prof.id}-index${idx}`}
            className={`shadow-sm cursor-pointer p-0 transition-colors ${selectedProfessor?.id === prof.id ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => onSelectProfessor(prof)}
          >
            <CardHeader className="flex flex-row items-center gap-3 p-4">
              <Avatar className="h-7 w-7 flex justify-center items-center">
                <span className='rounded-full bg-gray-300 dark:text-black px-4 py-2'>{prof.name[0]}</span>
              </Avatar>
              <div>
                <CardTitle className="text-sm">{prof.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{prof.courseName}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
