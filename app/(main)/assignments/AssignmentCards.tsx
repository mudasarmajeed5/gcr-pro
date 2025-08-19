import { Calendar, AlertTriangle, BookOpen } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDueDate } from '@/utils/formatDueDate'
import { Progress } from '@/components/ui/progress'
import { useSearchParams } from 'next/navigation'
interface AssignmentCardsProps {
    assignment: any
}

const getStatusBadge = (assignment: any, filter: any) => {
    if (filter === 'graded') {
        const percentage = assignment.totalMarks > 0
            ? Math.round((assignment.obtainedMarks || 0) / assignment.totalMarks * 100)
            : 0;

        let badgeColor = 'bg-gray-100 text-gray-800';
        if (percentage >= 90) badgeColor = 'bg-green-100 text-green-800';
        else if (percentage >= 80) badgeColor = 'bg-blue-100 text-blue-800';
        else if (percentage >= 70) badgeColor = 'bg-yellow-100 text-yellow-800';
        else if (percentage >= 60) badgeColor = 'bg-orange-100 text-orange-800';
        else badgeColor = 'bg-red-100 text-red-800';

        return <Badge className={badgeColor}>{percentage}%</Badge>;
    }

    if (filter === 'turnedIn') {
        return assignment.isGraded
            ? <Badge className="bg-green-100 text-green-800">Graded</Badge>
            : <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    }

    if (filter === 'unsubmitted') {
        return assignment.daysLeft !== undefined && assignment.daysLeft >= 0
            ? <Badge className="bg-yellow-100 text-yellow-800">{assignment.daysLeft} days left</Badge>
            : <Badge className="bg-gray-100 text-gray-800">No due date</Badge>;
    }

    if (filter === 'missed') {
        return <Badge className="bg-red-100 text-red-800">
            {assignment.daysOverdue} days overdue
        </Badge>;
    }

    return null;
}
const AssignmentCards = ({ assignment }: AssignmentCardsProps) => {
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter') || 'graded';
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                            {assignment.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 leading-tight line-clamp-2">
                            <BookOpen className="h-3 w-3 flex-shrink-0" />
                            <span>{assignment.courseName}</span>
                        </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                        {getStatusBadge(assignment,filter)}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                    {/* Due Date */}
                    {assignment.dueDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{formatDueDate(assignment)}</span>
                        </div>
                    )}

                    {/* Graded Assignments - Show Score */}
                    {filter === "graded" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span className="font-medium">
                                    {assignment.obtainedMarks}/{assignment.totalMarks}
                                </span>
                            </div>
                            <Progress
                                value={
                                    assignment.totalMarks > 0
                                        ? ((assignment.obtainedMarks || 0) / assignment.totalMarks) * 100
                                        : 0
                                }
                                className="h-2"
                            />
                        </div>
                    )}

                    {/* Turned In Assignments - Show Total Points */}
                    {filter === "turnedIn" && assignment.totalMarks > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Total Points</span>
                                <span className="font-medium">{assignment.totalMarks}</span>
                            </div>
                            {assignment.obtainedMarks !== undefined &&
                                assignment.obtainedMarks !== null && (
                                    <div className="flex justify-between text-sm">
                                        <span>Score</span>
                                        <span className="font-medium">
                                            {assignment.obtainedMarks}/{assignment.totalMarks}
                                        </span>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Unsubmitted & Missed - Show Total Points */}
                    {(filter === "unsubmitted" || filter === "missed") &&
                        assignment.totalMarks > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Total Points</span>
                                <span className="font-medium">{assignment.totalMarks}</span>
                            </div>
                        )}
                </div>

                {/* Late indicator - positioned at bottom */}
                {assignment.isLate && (
                    <div className="flex items-center gap-1 text-orange-600 text-sm mt-auto">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>Submitted late</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default AssignmentCards