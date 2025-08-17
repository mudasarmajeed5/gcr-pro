// app/api/assignments/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

interface Assignment {
    id: string;
    title: string;
    dueDate?: {
        year: number;
        month: number;
        day: number;
    };
    dueTime?: {
        hours: number;
        minutes: number;
    };
    maxPoints?: number;
    assignedGrade?: number;
    submissionState: 'TURNED_IN' | 'NEW' | 'CREATED' | 'RECLAIMED_BY_STUDENT';
    late?: boolean;
}

interface StudentSubmission {
    assignmentSubmission: {
        attachments?: any[];
    };
    submissionHistory: Array<{
        stateHistory: {
            state: string;
            stateTimestamp: string;
            actorUserId: string;
        };
    }>;
    state: string;
    late: boolean;
    assignedGrade?: number;
}

interface Course {
    id: string;
    name: string;
    courseState: string;
}

export async function GET(_request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch all courses first
        const coursesResponse = await fetch(
            "https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE",
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!coursesResponse.ok) {
            throw new Error("Failed to fetch courses");
        }

        const coursesData = await coursesResponse.json();
        const courses: Course[] = coursesData.courses || [];

        // Fetch assignments for all courses in parallel
        const courseAssignmentsPromises = courses.map(async (course) => {
            try {
                const assignmentsResponse = await fetch(
                    `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                );

                if (!assignmentsResponse.ok) {
                    console.warn(`Failed to fetch assignments for course ${course.id}`);
                    return { courseId: course.id, assignments: [] };
                }

                const assignmentsData = await assignmentsResponse.json();
                return {
                    courseId: course.id,
                    assignments: assignmentsData.courseWork || []
                };
            } catch (error) {
                console.warn(`Failed to process course ${course.id}:`, error);
                return { courseId: course.id, assignments: [] };
            }
        });

        const courseAssignments = await Promise.all(courseAssignmentsPromises);

        // Flatten all assignments with course context
        const allAssignments = courseAssignments.flatMap(({ courseId, assignments }) =>
            assignments.map((assignment: any) => ({ ...assignment, courseId }))
        );

        // Fetch submissions for all assignments in parallel
        const submissionPromises = allAssignments.map(async (assignment) => {
            try {
                const submissionsResponse = await fetch(
                    `https://classroom.googleapis.com/v1/courses/${assignment.courseId}/courseWork/${assignment.id}/studentSubmissions?userId=me`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                );

                if (!submissionsResponse.ok) {
                    return { assignmentId: assignment.id, submission: null, assignment };
                }

                const submissionsData = await submissionsResponse.json();
                const submissions: StudentSubmission[] = submissionsData.studentSubmissions || [];

                return {
                    assignmentId: assignment.id,
                    submission: submissions.length > 0 ? submissions[0] : null,
                    assignment
                };
            } catch (error) {
                console.warn(`Failed to fetch submission for assignment ${assignment.id}:`, error);
                return { assignmentId: assignment.id, submission: null, assignment };
            }
        });

        const submissionResults = await Promise.all(submissionPromises);

        // Process results
        let totalAssignments = 0;
        let turnedIn = 0;
        let unsubmitted = 0;
        let missed = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        const now = new Date();

        for (const { submission, assignment } of submissionResults) {
            totalAssignments++;
            const isOverdue = checkIfOverdue(assignment, now);

            if (submission) {
                if (submission.state === 'TURNED_IN' || submission.state === 'RETURNED') {
                    turnedIn++;

                    // Only add points if graded
                    if (submission.assignedGrade !== undefined && submission.assignedGrade !== null) {
                        earnedPoints += submission.assignedGrade;
                        totalPoints += assignment.maxPoints || 0;
                    }
                } else {
                    if (isOverdue) missed++;
                    else {
                        unsubmitted++;
                    }
                }
            } else {
                // No submission found
                if (isOverdue) missed++;
                else {
                    unsubmitted++;
                }
            }
        }

        // Calculate percentage
        const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const stats = {
            totalAssignments,
            turnedIn,
            unsubmitted,
            missed,
            totalPoints: Math.round(totalPoints),
            earnedPoints: Math.round(earnedPoints * 100) / 100,
            percentage: Math.round(percentage * 10) / 10,
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error("Error fetching assignment stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch assignment statistics" },
            { status: 500 }
        );
    }
}

// Helper function to check if assignment is overdue
function checkIfOverdue(assignment: any, currentDate: Date): boolean {
    if (!assignment.dueDate) {
        return false;
    }

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

    return currentDate > dueDate;
}