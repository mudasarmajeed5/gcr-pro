import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail } from 'lucide-react'

// Define the type for your instructor
interface Instructor {
  name: string
  email: string
}

// Define props for the component
interface InstructorCardProps {
  courseInstructor?: Instructor
  isLoading: boolean
}

const InstructorCard= ({ courseInstructor, isLoading }:InstructorCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Course Instructor</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : courseInstructor ? (
          <div className="space-y-4">
            {/* Instructor Name */}
            <p className="font-medium text-lg">{courseInstructor.name}</p>

            {/* Contact Information */}
            <p className="font-semibold">Contact Information</p>

            {/* Email with Icon */}
            <div className="flex items-start gap-3">
              <div className="bg-gray-50/10 rounded-md p-3">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">EMAIL</span>
                <a
                  href={`mailto:${courseInstructor.email}`}
                  className="text-blue-600 hover:underline text-xs"
                >
                  {courseInstructor.email}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No instructor assigned</p>
        )}
      </CardContent>
    </Card>
  )
}

export default InstructorCard
