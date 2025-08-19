"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from "next/link"
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, CheckCircle, XCircle, AlertTriangle, BookOpen, Clock } from 'lucide-react'
import { useAssignmentsLayout } from './layout'
import { formatDueDate } from "@/utils/formatDueDate"
import { useClassroomStore } from "@/store/classroom-store"

// Helper functions
const getDaysUntilDue = (assignment: any): number => {
    if (!assignment.dueDate) return -1;

    const dueDate = new Date(
        assignment.dueDate.year,
        assignment.dueDate.month - 1,
        assignment.dueDate.day
    );

    if (assignment.dueTime) {
        dueDate.setHours(assignment.dueTime.hours || 23);
        dueDate.setMinutes(assignment.dueTime.minutes || 59);
    } else {
        dueDate.setHours(23, 59, 59, 999);
    }

    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysOverdue = (assignment: any): number => {
    const daysUntil = getDaysUntilDue(assignment);
    return daysUntil < 0 ? Math.abs(daysUntil) : 0;
};

const Assignments = () => {
    const { data: _session, status } = useSession();
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter') || 'graded';
    const { setIsLoading } = useAssignmentsLayout();

    // Get data from store
    const {
        courses,
        assignments,
        isLoading,
        error,
        fetchClassroomData,
        getCourseById
    } = useClassroomStore();

    // Filter assignments based on URL parameter
    const filteredData = useMemo(() => {
        if (!assignments.length) return { assignments: [], count: 0 };

        const filteredAssignments: any[] = [];

        assignments.forEach((assignment) => {
            const course = getCourseById(assignment.courseId);
            const submission = assignment.submission;
            const isOverdue = assignment.isOverdue;

            const assignmentWithCourse = {
                ...assignment,
                courseName: course?.name || 'Unknown Course',
                maxPoints: assignment.maxPoints || 0,
                dueDate: assignment.dueDate,
                dueTime: assignment.dueTime
            };

            switch (filter) {
                case "graded":
                    // Only assignments that have been graded (have assignedGrade)
                    if (submission?.assignedGrade !== undefined && submission?.assignedGrade !== null) {
                        filteredAssignments.push({
                            ...assignmentWithCourse,
                            obtainedMarks: submission.assignedGrade,
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission.state,
                            isLate: submission.late
                        });
                    }
                    break;

                case "turnedIn":
                    // Assignments that are turned in (but may or may not be graded)
                    if (submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED') {
                        filteredAssignments.push({
                            ...assignmentWithCourse,
                            obtainedMarks: submission.assignedGrade || null,
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission.state,
                            isLate: submission.late,
                            isGraded: submission.assignedGrade !== undefined && submission.assignedGrade !== null
                        });
                    }
                    break;

                case "unsubmitted":
                    // Assignments not yet submitted and not overdue
                    if ((!submission || submission.state !== 'TURNED_IN') && !isOverdue) {
                        filteredAssignments.push({
                            ...assignmentWithCourse,
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission?.state || 'NOT_SUBMITTED',
                            daysLeft: getDaysUntilDue(assignment)
                        });
                    }
                    break;

                case "missed":
                    // Assignments that are overdue and not submitted
                    if ((!submission || submission.state !== 'TURNED_IN') && isOverdue && !submission?.assignedGrade) {
                        filteredAssignments.push({
                            ...assignmentWithCourse,
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission?.state || 'NOT_SUBMITTED',
                            daysOverdue: getDaysOverdue(assignment)
                        });
                    }
                    break;
            }
        });

        return {
            assignments: filteredAssignments,
            count: filteredAssignments.length
        };
    }, [assignments, courses, filter, getCourseById]);

    // Set loading state for layout
    useEffect(() => {
        setIsLoading(isLoading);
    }, [isLoading, setIsLoading]);

    // Fetch data on mount
    useEffect(() => {
        if (status === "authenticated") {
            fetchClassroomData();
        }
    }, [status, fetchClassroomData]);

    const getFilterColor = (filter: string) => {
        switch (filter) {
            case 'graded': return 'text-green-600 bg-green-50 border-green-200';
            case 'turnedIn': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'unsubmitted': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'missed': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    }

    const getFilterIcon = (filter: string) => {
        switch (filter) {
            case 'graded': return <CheckCircle className="h-5 w-5" />;
            case 'turnedIn': return <BookOpen className="h-5 w-5" />;
            case 'unsubmitted': return <Clock className="h-5 w-5" />;
            case 'missed': return <XCircle className="h-5 w-5" />;
            default: return <BookOpen className="h-5 w-5" />;
        }
    }

    const getStatusBadge = (assignment: any) => {
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

    if (status === "loading" || isLoading) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-2 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Alert className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Please sign in to view your assignments.
                </AlertDescription>
            </Alert>
        );
    }

    if (error) {
        return (
            <Alert className="mt-6" variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                    Error loading assignments: {error}
                </AlertDescription>
            </Alert>
        );
    }

    const filterTitle = filter.charAt(0).toUpperCase() + filter.slice(1);

    return (
        <>
            {/* Filter Summary */}
            <div className={`rounded-lg border p-4 mb-6 ${getFilterColor(filter)}`}>
                <div className="flex items-center gap-3">
                    {getFilterIcon(filter)}
                    <div>
                        <h1 className="text-xl font-bold">{filterTitle} Assignments</h1>
                        <p className="text-sm opacity-80">
                            {filteredData.count} assignment{filteredData.count !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Assignments Grid */}
            {filteredData.count === 0 ? (
                <Card className="text-center p-8">
                    <div className="flex flex-col items-center gap-3">
                        {getFilterIcon(filter)}
                        <h3 className="text-lg font-semibold">No {filter} assignments found</h3>
                        <p className="text-gray-600">
                            {filter === 'graded' && "No assignments have been graded yet."}
                            {filter === 'turnedIn' && "No assignments have been submitted yet."}
                            {filter === 'unsubmitted' && "Great! No pending assignments."}
                            {filter === 'missed' && "Great! No missed assignments."}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredData.assignments.map((assignment) => (
                        <Link key={assignment.id} href={`/assignments/${assignment.id}`} className="block">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg leading-tight">
                                                {assignment.title}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <BookOpen className="h-3 w-3" />
                                                {assignment.courseName}
                                            </CardDescription>
                                        </div>
                                        {getStatusBadge(assignment)}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Due Date */}
                                    {assignment.dueDate && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            {formatDueDate(assignment)}
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
                                                        ? ((assignment.obtainedMarks || 0) / assignment.totalMarks) *
                                                        100
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

                                    {/* Late indicator */}
                                    {assignment.isLate && (
                                        <div className="flex items-center gap-1 text-orange-600 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Submitted late</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

export default Assignments