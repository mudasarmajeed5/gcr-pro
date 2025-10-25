/* eslint-disable */

"use client"

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from "next/link"
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, BookOpen, Clock } from 'lucide-react'
import { useAssignmentsLayout } from './layout'
import { useClassroomStore } from "@/store/classroom-store"
import AssignmentCards from './AssignmentCards'
import UILoading from '@/components/UILoading'

// Helper functions - Memoized to avoid recalculation
const getDaysUntilDueCache = new Map<string, number>();
const getDaysUntilDue = (assignment: any): number => {
    const key = `${assignment.id}`;
    if (getDaysUntilDueCache.has(key)) return getDaysUntilDueCache.get(key)!;

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
    const result = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    getDaysUntilDueCache.set(key, result);
    return result;
};

const getDaysOverdue = (assignment: any): number => {
    const daysUntil = getDaysUntilDue(assignment);
    return daysUntil < 0 ? Math.abs(daysUntil) : 0;
};

const AssignmentsContent = () => {
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
        if (!assignments || assignments.length === 0) return { assignments: [], count: 0 };

        const courseMap = new Map<string, any>();
        for (const c of courses) courseMap.set(c.id, c);

        const filteredAssignments: any[] = [];

        for (const assignment of assignments) {
            const submission = assignment.submission;
            const isOverdue = assignment.isOverdue;

            switch (filter) {
                case "graded":
                    if (submission?.assignedGrade !== undefined && submission?.assignedGrade !== null) {
                        filteredAssignments.push({
                            ...assignment,
                            courseName: courseMap.get(assignment.courseId)?.name || 'Unknown Course',
                            obtainedMarks: submission.assignedGrade,
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission.state,
                            isLate: submission.late
                        });
                    }
                    break;

                case "turnedIn":
                    if (submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED') {
                        filteredAssignments.push({
                            ...assignment,
                            courseName: courseMap.get(assignment.courseId)?.name || 'Unknown Course',
                            obtainedMarks: submission.assignedGrade || null,
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission.state,
                            isLate: submission.late,
                            isGraded: submission.assignedGrade !== undefined && submission.assignedGrade !== null
                        });
                    }
                    break;

                case "unsubmitted":
                    if ((!submission || submission.state !== 'TURNED_IN') && !isOverdue) {
                        filteredAssignments.push({
                            ...assignment,
                            courseName: courseMap.get(assignment.courseId)?.name || 'Unknown Course',
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission?.state || 'NOT_SUBMITTED',
                            daysLeft: getDaysUntilDue(assignment)
                        });
                    }
                    break;

                case "missed":
                    if ((!submission || submission.state !== 'TURNED_IN') && isOverdue && !submission?.assignedGrade) {
                        filteredAssignments.push({
                            ...assignment,
                            courseName: courseMap.get(assignment.courseId)?.name || 'Unknown Course',
                            totalMarks: assignment.maxPoints || 0,
                            submissionState: submission?.state || 'NOT_SUBMITTED',
                            daysOverdue: getDaysOverdue(assignment)
                        });
                    }
                    break;
            }
        }

        return {
            assignments: filteredAssignments,
            count: filteredAssignments.length
        };
    }, [assignments, courses, filter]);

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
                        <Link key={`${filter}-${assignment.id}`} href={`/assignments/${assignment.id}`} className="block h-full">
                            <AssignmentCards assignment={assignment} filter={filter} />
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

const Assignments = () => {
    return (
        <Suspense fallback={<UILoading />}>
            <AssignmentsContent />
        </Suspense>
    );
}

export default Assignments  