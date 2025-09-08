import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Course } from "@/types/all-data";
interface Assignment {
    id: string;
    title: string;
    courseName?: string;
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
}

// Base assignment interface (extends your existing Assignment)
interface BaseFilteredAssignment extends Assignment {
    courseName: string;
    isOverdue: boolean;
    totalMarks: number;
    submissionState: string;
}

// Specific interfaces for each filter type
interface GradedAssignment extends BaseFilteredAssignment {
    obtainedMarks: number;
    isLate: boolean;
}

interface TurnedInAssignment extends BaseFilteredAssignment {
    obtainedMarks: number | null;
    isLate: boolean;
    isGraded: boolean;
}

interface UnsubmittedAssignment extends BaseFilteredAssignment {
    daysLeft: number | null;
}

interface MissedAssignment extends BaseFilteredAssignment {
    daysOverdue: number | null;
}

type FilteredAssignment = 
    | GradedAssignment 
    | TurnedInAssignment 
    | UnsubmittedAssignment 
    | MissedAssignment;



interface StudentSubmission {
    courseWorkId: string;
    state: string;
    late: boolean;
    assignedGrade?: number;
}

export async function GET(request: NextRequest) {
    try {
        const filter = request.nextUrl.searchParams.get("filter");
        console.log("Filter requested:", filter);

        // Validate filter parameter
        const validFilters = ["turnedIn", "graded", "unsubmitted", "missed"];
        if (!filter || !validFilters.includes(filter)) {
            return NextResponse.json(
                { error: "Invalid filter. Use: turnedIn, graded, unsubmitted, or missed" },
                { status: 400 }
            );
        }

        const session = await auth();
        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const headers = {
            Authorization: `Bearer ${session.accessToken}`,
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
        };

        // Fetch courses
        const coursesResponse = await fetch(
            "https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE&fields=courses(id,name,courseState)&pageSize=1000",
            { headers }
        );

        if (!coursesResponse.ok) {
            throw new Error("Failed to fetch courses");
        }

        const coursesData = await coursesResponse.json();
        const courses = coursesData.courses || [];

        // Create course name map for quick lookup
        const courseNameMap = new Map();
        courses.forEach((course: Course) => {
            courseNameMap.set(course.id, course.name);
        });

        // Fetch assignments and submissions for all courses
        const courseDataPromises = courses.map(async (course: Course) => {
            try {
                const [assignmentsResponse, submissionsResponse] = await Promise.all([
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?fields=courseWork(id,title,dueDate,dueTime,maxPoints)&pageSize=1000`,
                        { headers }
                    ),
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me&fields=studentSubmissions(courseWorkId,state,assignedGrade,late)&pageSize=1000`,
                        { headers }
                    )
                ]);

                let assignments = [];
                let submissions = [];

                if (assignmentsResponse.ok) {
                    const assignmentsData = await assignmentsResponse.json();
                    assignments = assignmentsData.courseWork || [];
                }

                if (submissionsResponse.ok) {
                    const submissionsData = await submissionsResponse.json();
                    submissions = submissionsData.studentSubmissions || [];
                }

                return {
                    courseId: course.id,
                    assignments,
                    submissions
                };
            } catch (error) {
                console.warn(`Failed to process course ${course.id}:`, error);
                return { courseId: course.id, assignments: [], submissions: [] };
            }
        });

        const courseData = await Promise.all(courseDataPromises);
        const filteredAssignments: FilteredAssignment[] = [];
        const now = new Date();

        // Process and filter assignments based on the requested filter
        courseData.forEach(({ courseId, assignments, submissions }) => {
            const submissionMap = new Map();
            submissions.forEach((submission: StudentSubmission) => {
                submissionMap.set(submission.courseWorkId, submission);
            });

            assignments.forEach((assignment: Assignment) => {
                const submission = submissionMap.get(assignment.id);
                const courseName = courseNameMap.get(courseId);
                const isOverdue = checkIfOverdue(assignment, now);

                // Create base assignment object with course name
                const assignmentWithCourse = {
                    ...assignment,
                    courseName,
                    isOverdue
                };

                // Filter based on the requested type
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
        });

        return NextResponse.json({
            status: 200,
            filter,
            count: filteredAssignments.length,
            assignments: filteredAssignments
        });

    } catch (error) {
        console.error("Error fetching filtered assignments:", error);
        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        );
    }
}

// Helper function to check if assignment is overdue
function checkIfOverdue(assignment: Assignment, currentDate: Date): boolean {
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

// Helper function to get days until due date
function getDaysUntilDue(assignment: Assignment): number | null {
    if (!assignment.dueDate) return null;

    const dueDate = new Date(
        assignment.dueDate.year,
        assignment.dueDate.month - 1,
        assignment.dueDate.day
    );

    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}

// Helper function to get days overdue
function getDaysOverdue(assignment: Assignment): number | null {
    if (!assignment.dueDate) return null;

    const dueDate = new Date(
        assignment.dueDate.year,
        assignment.dueDate.month - 1,
        assignment.dueDate.day
    );

    const now = new Date();
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}