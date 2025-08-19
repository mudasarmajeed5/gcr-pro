import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecentAssignment } from '@/types/Assignment'

// Props for the component
interface RecentAssignmentsCardProps {
  courseAssignments: RecentAssignment[]
  isLoading: boolean
}

const RecentAssignmentsCard: React.FC<RecentAssignmentsCardProps> = ({ courseAssignments, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assignments</CardTitle>
        <CardDescription>Your most recent assignments in this course</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : courseAssignments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No assignments found for this course.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseAssignments.slice(0, 5).map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>
                    {assignment.dueDate
                      ? `${assignment.dueDate.month}/${assignment.dueDate.day}/${assignment.dueDate.year}`
                      : 'No due date'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        assignment.submissionState === 'RETURNED'
                          ? 'default'
                          : assignment.submissionState === 'TURNED_IN'
                          ? 'default'
                          : assignment.isOverdue
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {assignment.submissionState === 'RETURNED'
                        ? 'Graded'
                        : assignment.submissionState === 'TURNED_IN'
                        ? 'Submitted'
                        : assignment.isOverdue
                        ? 'Overdue'
                        : 'Pending'}
                      {assignment.late &&
                        !['RETURNED', 'TURNED_IN'].includes(assignment.submissionState) &&
                        ' (Late)'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {assignment.assignedGrade !== undefined
                      ? `${assignment.assignedGrade}/${assignment.maxPoints}`
                      : 'Not graded'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" className="w-full">
          View All Assignments
        </Button>
      </CardFooter>
    </Card>
  )
}

export default RecentAssignmentsCard
