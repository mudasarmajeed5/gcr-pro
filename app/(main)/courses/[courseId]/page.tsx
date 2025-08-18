// app/course/[courseId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useCourseAssignments, useCourseStats } from '@/store/useClassroom';
import Link from 'next/link';

export default function CoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    
    const { 
        course, 
        assignments, 
        assignmentCount, 
        turnedInCount, 
        overdueCount, 
        pendingCount 
    } = useCourseAssignments(courseId);
    
    const stats = useCourseStats(courseId);

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Course not found</h1>
                    <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total</h3>
                    <p className="text-2xl font-bold text-blue-600">{assignmentCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Submitted</h3>
                    <p className="text-2xl font-bold text-green-600">{turnedInCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Overdue</h3>
                    <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Grade</h3>
                    <p className="text-2xl font-bold text-purple-600">{stats.percentage}%</p>
                </div>
            </div>

            {/* Assignment Filters */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        All ({assignmentCount})
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Pending ({pendingCount})
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Submitted ({turnedInCount})
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Overdue ({overdueCount})
                    </button>
                </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {assignments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 italic">No assignments found for this course.</p>
                    </div>
                ) : (
                    assignments.map((assignment:any) => (
                        <div 
                            key={assignment.id}
                            className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${
                                assignment.submissionState === 'TURNED_IN' 
                                    ? 'border-l-green-500' 
                                    : assignment.isOverdue 
                                    ? 'border-l-red-500'
                                    : 'border-l-yellow-500'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        {assignment.title}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        {assignment.dueDate && (
                                            <div>
                                                <span className="font-medium">Due Date:</span>
                                                <p>{assignment.dueDate.month}/{assignment.dueDate.day}/{assignment.dueDate.year}
                                                {assignment.dueTime && (
                                                    ` at ${assignment.dueTime.hours}:${assignment.dueTime.minutes.toString().padStart(2, '0')}`
                                                )}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {assignment.maxPoints && (
                                            <div>
                                                <span className="font-medium">Points:</span>
                                                <p>{assignment.assignedGrade !== undefined ? assignment.assignedGrade : 'Not graded'} / {assignment.maxPoints}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <span className="font-medium">Status:</span>
                                            <p className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    assignment.submissionState === 'TURNED_IN' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : assignment.isOverdue
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {assignment.submissionState === 'TURNED_IN' 
                                                        ? 'Submitted' 
                                                        : assignment.isOverdue 
                                                        ? 'Overdue'
                                                        : 'Pending'
                                                    }
                                                </span>
                                                {assignment.late && (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium">
                                                        Late
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Submission details if available */}
                                    {assignment.submission && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded">
                                            <h4 className="font-medium text-gray-700 mb-2">Submission Details</h4>
                                            <div className="text-sm text-gray-600">
                                                <p>State: {assignment.submission.state}</p>
                                                {assignment.submission.assignmentSubmission?.attachments && (
                                                    <p>Attachments: {assignment.submission.assignmentSubmission.attachments.length}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}