"use client"
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, CheckCircle, XCircle, AlertTriangle, BookOpen } from 'lucide-react'
import { useAssignmentsLayout } from './layout'

interface Assignment {
    id: string;
    title: string;
    courseName: string;
    obtainedMarks?: number;
    totalMarks: number;
    submissionState: string;
    isLate?: boolean;
    isGraded?: boolean;
    daysLeft?: number;
    daysOverdue?: number;
    isOverdue?: boolean;
    dueDate?: {
        year: number;
        month: number;
        day: number;
    };
    dueTime?: {
        hours: number;
        minutes: number;
    };
}

interface AssignmentsData {
    status: number;
    filter: string;
    count: number;
    assignments: Assignment[];
}

const Assignments = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter') || 'graded';
    const { setIsLoading } = useAssignmentsLayout();
    
    const [data, setData] = useState<AssignmentsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getData = async () => {
        try {
            setLoading(true);
            setIsLoading(true); // Disable tabs in layout
            setError(null);
            const response = await fetch(`/api/assignments?filter=${filter}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch assignments');
            }
            
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
            setIsLoading(false); // Re-enable tabs in layout
        }
    }

    useEffect(() => {
        if (status === "authenticated") {
            getData();
        }
    }, [session?.user?.id, filter])

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

    const formatDueDate = (assignment: Assignment) => {
        if (!assignment.dueDate) return null;
        
        const date = new Date(
            assignment.dueDate.year,
            assignment.dueDate.month - 1,
            assignment.dueDate.day
        );
        
        if (assignment.dueTime) {
            date.setHours(assignment.dueTime.hours || 0);
            date.setMinutes(assignment.dueTime.minutes || 0);
        }
        
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    const getStatusBadge = (assignment: Assignment) => {
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
            return assignment.daysLeft !== undefined 
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

    if (status === "loading" || loading) {
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

    if (!data) {
        return null;
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
                            {data ? `${data.count} assignment${data.count !== 1 ? 's' : ''}` : 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Assignments Grid */}
            {data.count === 0 ? (
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
                    {data.assignments.map((assignment) => (
                        <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
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
                                {filter === 'graded' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Score</span>
                                            <span className="font-medium">
                                                {assignment.obtainedMarks}/{assignment.totalMarks}
                                            </span>
                                        </div>
                                        <Progress 
                                            value={assignment.totalMarks > 0 
                                                ? (assignment.obtainedMarks || 0) / assignment.totalMarks * 100 
                                                : 0
                                            } 
                                            className="h-2"
                                        />
                                    </div>
                                )}

                                {/* Turned In Assignments - Show Total Points */}
                                {filter === 'turnedIn' && assignment.totalMarks > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Total Points</span>
                                            <span className="font-medium">{assignment.totalMarks}</span>
                                        </div>
                                        {assignment.obtainedMarks !== undefined && assignment.obtainedMarks !== null && (
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
                                {(filter === 'unsubmitted' || filter === 'missed') && assignment.totalMarks > 0 && (
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
                    ))}
                </div>
            )}
        </>
    );
}

export default Assignments