'use client'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CourseWorkMaterial } from '@/types/all-data'
import { FileText, Link as LinkIcon, File, Youtube } from 'lucide-react'

interface CourseMaterialsCardProps {
  courseMaterials: CourseWorkMaterial[]
  isLoading: boolean
  courseId: string
}

const CourseMaterialsCard: React.FC<CourseMaterialsCardProps> = ({ courseMaterials, isLoading , courseId}) => {
  const router = useRouter()
  // Calculate counts
  const counts = {
    driveFile: 0,
    youtubeVideo: 0,
    form: 0,
    link: 0,
  }

  courseMaterials.forEach((work) => {
    work.materials?.forEach((mat) => {
      if (mat.driveFile) counts.driveFile++
      if (mat.youtubeVideo) counts.youtubeVideo++
      if (mat.form) counts.form++
      if (mat.link) counts.link++
    })
  })


  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
        <CardDescription>Resources for this course</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p>Loading materials...</p>
        ) : courseMaterials.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No materials found for this course.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>
                <FileText className="inline w-5 h-5 mr-1" /> Drive Files ({counts.driveFile})
              </span>
            </div>
            <span>
              <Youtube className="inline w-5 h-5 mr-1 text-red-500" /> YouTube Videos ({counts.youtubeVideo})
            </span>
            <span>
              <File className="inline w-5 h-5 mr-1 text-blue-600" /> Forms ({counts.form})
            </span>
            <span>
              <LinkIcon className="inline w-5 h-5 mr-1 text-green-600" /> Links ({counts.link})
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="link" onClick={()=>{router.push(`/courses/${courseId}/materials`)}} className="w-full">
          View All Materials
        </Button>
      </CardFooter>
    </Card>
  )
}

export default CourseMaterialsCard
