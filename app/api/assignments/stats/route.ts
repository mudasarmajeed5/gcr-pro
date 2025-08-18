import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

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
    courseWorkId: string; // This links submission to assignment
}

interface Course {
    id: string;
    name: string;
    courseState: string;
}

// Cache helper functions
function getCached(key: string) {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
    }
    
    return cached.data;
}

function setCache(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
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

        const cacheKey = `stats-${session.user?.id || 'user'}`;
        const cachedStats = getCached(cacheKey);
        if (cachedStats) {
            return NextResponse.json(cachedStats);
        }

        // Optimized headers for all requests
        const headers = {
            Authorization: `Bearer ${session.accessToken}`,
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
        };

        // Fetch courses with field filtering
        const coursesResponse = await fetch(
            "https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE&fields=courses(id,name,courseState)&pageSize=1000",
            { headers }
        );

        if (!coursesResponse.ok) {
            throw new Error("Failed to fetch courses");
        }

        const coursesData = await coursesResponse.json();
        const courses: Course[] = coursesData.courses || [];

        // Fetch assignments AND submissions for all courses in parallel
        const courseDataPromises = courses.map(async (course) => {
            try {
                // Make both requests in parallel for each course
                const [assignmentsResponse, submissionsResponse] = await Promise.all([
                    // Get assignments
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?fields=courseWork(id,title,dueDate,dueTime,maxPoints)&pageSize=1000`,
                        { headers }
                    ),
                    // Get ALL submissions for this course at once (KEY OPTIMIZATION!)
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

        // Process results
        let totalAssignments = 0;
        let turnedIn = 0;
        let unsubmitted = 0;
        let missed = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        const now = new Date();

        // Process each course's data
        courseData.forEach(({ assignments, submissions }) => {
            // Create a map of submissions by courseWorkId for quick lookup
            const submissionMap = new Map();
            submissions.forEach((submission: StudentSubmission) => {
                submissionMap.set(submission.courseWorkId, submission);
            });

            // Process each assignment
            assignments.forEach((assignment: Assignment) => {
                totalAssignments++;
                const submission = submissionMap.get(assignment.id);
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
                        else unsubmitted++;
                    }
                } else {
                    // No submission found
                    if (isOverdue) missed++;
                    else unsubmitted++;
                }
            });
        });

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

        // Cache the results
        setCache(cacheKey, stats);

        return NextResponse.json(stats);

    } catch (error) {
        console.error("Error fetching assignment stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch assignment statistics, Login again" },
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