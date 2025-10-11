'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useClassroomStore } from '@/store/classroom-store';
import { Professor } from '@/types/all-data';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin } from 'lucide-react';
import InstructorCard from './components/InstructorCard';
import RecentAssignmentsCard from './components/RecentAssignments';
import CourseMaterialsCard from './components/CourseMaterialCard';
import { useRouter } from 'next/navigation';
import AnnouncementsCard from './components/AnnoucementsCard';
import { Button } from '@/components/ui/button';

export default function CoursePage() {
    const router = useRouter();
    const params = useParams();
    const [courseInstructor, setCourseInstructor] = useState<Professor>()
    const courseId = params.courseId as string;

    const {
        fetchClassroomData,
        isLoading,
        getAssignmentsByCourseId,
        getCourseById,
        getMaterialsByCourseId,
        getProfessorsByCourseId
    } = useClassroomStore();

    const courseMaterials = getMaterialsByCourseId(courseId);
    const courseProfessors = getProfessorsByCourseId(courseId);

    // Fetch store data if stale
    useEffect(() => {
        fetchClassroomData();
    }, [fetchClassroomData]);

    // Set course instructor from Zustand store
    useEffect(() => {
        if (courseProfessors.length > 0) {
            setCourseInstructor(courseProfessors[0]); // Get first professor
        }
    }, [courseProfessors]);

    // Get course and assignments
    const course = getCourseById(courseId);
    const courseAssignments = getAssignmentsByCourseId(courseId);

    // Stats counts
    const assignmentCount = courseAssignments.length;
    const completedCount = courseAssignments.filter(a =>
        ['TURNED_IN', 'RETURNED'].includes(a.submissionState)
    ).length;
    const overdueCount = courseAssignments.filter(a =>
        a.isOverdue && !['TURNED_IN', 'RETURNED'].includes(a.submissionState)
    ).length;
    const pendingCount = courseAssignments.filter(a =>
        !a.isOverdue && !['TURNED_IN', 'RETURNED'].includes(a.submissionState)
    ).length;

    if (!course && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Course not found</h1>
                    <Link href="/courses" className="text-blue-500 hover:underline mt-4 flex items-center gap-2">
                        <ArrowLeft /> <span>Back to Courses</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link href="/courses">
                    <Button variant="ghost" className="w-fit flex items-center gap-2">
                        <ArrowLeft /> <span>Back to Courses</span>
                    </Button>
                </Link>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2" />
                ) : (
                    <h1 className="text-3xl font-bold tracking-tight">{course?.name}</h1>
                )}
                {isLoading ? (
                    <Skeleton className="h-4 w-1/3" />
                ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        {course?.section && (
                            <div className="mt-2 sm:mt-0">
                                <span
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium shadow-sm ring-1 ring-secondary/25"
                                    title={`Class: ${course.section}`}
                                    aria-label={`Class ${course.section}`}
                                >
                                    <span className="text-xs sm:text-sm font-semibold opacity-95">Class:</span>
                                    <span className="leading-none ml-1">{course.section}</span>
                                </span>
                            </div>
                        )}
                        {course?.room && (
                            <div className="mt-2 sm:mt-0">
                                <span
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md ring-1 ring-primary/30"
                                    title={`Location: ${course.room}`}
                                    aria-label={`Location ${course.room}`}
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm font-semibold opacity-95">Location:</span>
                                    <span className="leading-none ml-1">{course.room}</span>
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Course Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Announcement Card */}
                    <AnnouncementsCard courseId={courseId} />
                    {/* Assignments Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignments</CardTitle>
                            <CardDescription>Your progress in this course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="flex flex-col items-center p-4 border rounded-lg">
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <span className="text-2xl font-bold">{assignmentCount}</span>
                                </div>
                                <div className="flex flex-col items-center p-4 border rounded-lg">
                                    <span className="text-sm text-muted-foreground">Submitted</span>
                                    <span className="text-2xl font-bold text-green-600">{completedCount}</span>
                                </div>
                                <div className="flex flex-col items-center p-4 border rounded-lg">
                                    <span className="text-sm text-muted-foreground">Overdue</span>
                                    <span className="text-2xl font-bold text-red-600">{overdueCount}</span>
                                </div>
                                <div className="flex flex-col items-center p-4 border rounded-lg">
                                    <span className="text-sm text-muted-foreground">Pending</span>
                                    <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Assignments */}
                    <RecentAssignmentsCard courseAssignments={courseAssignments} isLoading={isLoading} />
                </div>

                {/* Right Column - Course Info */}
                <div className="space-y-6">
                    <CourseMaterialsCard courseMaterials={courseMaterials} courseId={courseId} isLoading={isLoading} />

                    <InstructorCard courseInstructor={courseInstructor} isLoading={isLoading} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="link" className="w-full justify-start p-0">
                                <a href={course?.alternateLink} target="_blank" rel="noopener noreferrer">
                                    Open in Google Classroom
                                </a>
                            </Button>
                            <Separator className="my-2" />
                            <Button variant="link" onClick={() => { router.push("/send-email") }} className="w-full justify-start p-0">
                                Contact Instructor
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}