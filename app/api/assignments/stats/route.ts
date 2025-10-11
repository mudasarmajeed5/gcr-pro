/* eslint-disable */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";
import { Announcement, CourseWorkMaterial } from "@/types/all-data";
import { Material } from "@/types/all-data";

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
    submissionState: 'TURNED_IN' | 'NEW' | 'CREATED' | 'RETURNED';
    late?: boolean;
    courseId: string;
    submission?: StudentSubmission | null;
    isOverdue?: boolean;
    materials?: Material[];
}

interface StudentSubmission {
    submissionHistory?: Array<{
        stateHistory: {
            state: string;
            stateTimestamp: string;
            actorUserId: string;
        };
    }>;
    state: string;
    late: boolean;
    assignedGrade?: number;
    courseWorkId: string;
}

interface Course {
    id: string;
    name: string;
    section?: string;
    descriptionHeading?: string;
    description?: string;
    room?: string;
    ownerId: string;
    creationTime: string;
    updateTime: string;
    enrollmentCode?: string;
    courseState: string;
    alternateLink: string;
}

interface ClassroomStats {
    totalAssignments: number;
    turnedIn: number;
    unsubmitted: number;
    missed: number;
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
}

interface ClassroomData {
    courses: Course[];
    materials: CourseWorkMaterial[];
    announcements: Announcement[];
    assignments: Assignment[];
    stats: ClassroomStats;
}

interface CourseDataResult {
    courseId: string;
    assignments: Array<{
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
        materials?: Material[];
    }>;
    submissions: StudentSubmission[];
    announcements: Announcement[];
    courseWorkMaterials: CourseWorkMaterial[];
}

const CACHE_TTL = 30 * 60; // 30 minutes in seconds

function checkIfOverdue(assignment: Assignment, currentDate: Date): boolean {
    if (!assignment.dueDate) return false;

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

async function getCachedData(userId: string): Promise<ClassroomData | null> {
    try {
        const cached = await kv.get(`classroom:${userId}`);
        return cached as ClassroomData | null;
    } catch (error) {
        console.warn("Vercel KV get error:", error);
        return null;
    }
}

async function setCacheData(userId: string, data: ClassroomData): Promise<void> {
    try {
        await kv.setex(`classroom:${userId}`, CACHE_TTL, JSON.stringify(data));
    } catch (error) {
        console.warn("Vercel KV set error:", error);
        // Cache failure shouldn't break the app
    }
}

async function clearUserCache(userId: string): Promise<void> {
    try {
        await kv.del(`classroom:${userId}`);
    } catch (error) {
        console.warn("Vercel KV delete error:", error);
    }
}

async function fetchClassroomData(
    headers: Record<string, string>,
    courses: Course[]
): Promise<ClassroomData> {
    if (!courses.length) {
        return {
            courses: [],
            materials: [],
            announcements: [],
            assignments: [],
            stats: {
                totalAssignments: 0,
                turnedIn: 0,
                unsubmitted: 0,
                missed: 0,
                totalPoints: 0,
                earnedPoints: 0,
                percentage: 0,
            }
        };
    }

    const courseDataPromises = courses.map(async (course) => {
        try {
            const [assignmentsResponse, submissionsResponse, announcementsResponse, materialsResponse] = await Promise.all([
                fetch(
                    `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?fields=courseWork(id,title,dueDate,dueTime,maxPoints,materials)&pageSize=1000`,
                    { headers }
                ),
                fetch(
                    `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me&fields=studentSubmissions(courseWorkId,state,assignedGrade,late)&pageSize=1000`,
                    { headers }
                ),
                fetch(
                    `https://classroom.googleapis.com/v1/courses/${course.id}/announcements?fields=announcements(id,text,creationTime,materials)&pageSize=1000`,
                    { headers }
                ),
                fetch(
                    `https://classroom.googleapis.com/v1/courses/${course.id}/courseWorkMaterials?fields=courseWorkMaterial(id,title,description,materials,creationTime)&pageSize=1000`,
                    { headers }
                )
            ]);

            const [assignmentsData, submissionsData, announcementsData, materialsData] = await Promise.all([
                assignmentsResponse.ok ? assignmentsResponse.json() : { courseWork: [] },
                submissionsResponse.ok ? submissionsResponse.json() : { studentSubmissions: [] },
                announcementsResponse.ok ? announcementsResponse.json() : { announcements: [] },
                materialsResponse.ok ? materialsResponse.json() : { courseWorkMaterial: [] }
            ]);

            const result: CourseDataResult = {
                courseId: course.id,
                assignments: assignmentsData.courseWork || [],
                submissions: submissionsData.studentSubmissions || [],
                announcements: announcementsData.announcements || [],
                courseWorkMaterials: materialsData.courseWorkMaterial || []
            };

            return result;
        } catch (error) {
            console.warn(`Failed to process course ${course.id}:`, error);
            return {
                courseId: course.id,
                assignments: [],
                submissions: [],
                announcements: [],
                courseWorkMaterials: []
            };
        }
    });

    const courseData = await Promise.all(courseDataPromises);

    const allAssignments: Assignment[] = [];
    const allCourseWork: CourseWorkMaterial[] = [];
    const allAnnouncements: Announcement[] = [];

    let totalAssignments = 0;
    let turnedIn = 0;
    let unsubmitted = 0;
    let missed = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const now = new Date();

    courseData.forEach(({ courseId, assignments, submissions, announcements, courseWorkMaterials }) => {
        const submissionMap = new Map(
            submissions.map((s: StudentSubmission) => [s.courseWorkId, s])
        );

        courseWorkMaterials.forEach((item: CourseWorkMaterial) => {
            allCourseWork.push({ ...item, courseId });
        });

        announcements.forEach((item: Announcement) => {
            allAnnouncements.push({ ...item, courseId });
        });

        assignments.forEach((rawAssignment: any) => {
            const submission = submissionMap.get(rawAssignment.id);
            const isOverdue = checkIfOverdue(
                {
                    id: rawAssignment.id,
                    title: rawAssignment.title,
                    dueDate: rawAssignment.dueDate,
                    dueTime: rawAssignment.dueTime,
                    maxPoints: rawAssignment.maxPoints,
                    courseId,
                    materials: rawAssignment.materials || [],
                    submissionState: 'NEW'
                } as Assignment,
                now
            );

            allAssignments.push({
                id: rawAssignment.id,
                title: rawAssignment.title,
                dueDate: rawAssignment.dueDate,
                dueTime: rawAssignment.dueTime,
                maxPoints: rawAssignment.maxPoints,
                assignedGrade: submission?.assignedGrade,
                submissionState: (submission?.state as Assignment['submissionState']) || 'NEW',
                late: submission?.late || false,
                courseId,
                materials: rawAssignment.materials || [],
                submission: submission || null,
                isOverdue
            });

            totalAssignments++;

            if (submission) {
                if (submission.state === 'TURNED_IN' || submission.state === 'RETURNED') {
                    turnedIn++;

                    if (submission.assignedGrade !== undefined && submission.assignedGrade !== null) {
                        earnedPoints += submission.assignedGrade;
                        totalPoints += rawAssignment.maxPoints || 0;
                    }
                } else {
                    isOverdue ? missed++ : unsubmitted++;
                }
            } else {
                isOverdue ? missed++ : unsubmitted++;
            }
        });
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    return {
        courses,
        materials: allCourseWork,
        announcements: allAnnouncements,
        assignments: allAssignments,
        stats: {
            totalAssignments,
            turnedIn,
            unsubmitted,
            missed,
            totalPoints: Math.round(totalPoints),
            earnedPoints: Math.round(earnedPoints * 100) / 100,
            percentage: Math.round(percentage * 10) / 10,
        }
    };
}

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user?.id || session.user?.email || 'default';

        // Check for force refresh parameter
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';

        if (forceRefresh) {
            console.log(`🔄 Force refresh requested - clearing cache for user: ${userId}`);
            await clearUserCache(userId);
        } else {
            // Check Vercel KV cache first
            const cachedData = await getCachedData(userId);
            if (cachedData) {
                console.log(`✅ Serving cached data for user: ${userId}`);
                return NextResponse.json(cachedData);
            }
        }

        console.log(`🔄 Cache miss - fetching fresh data for user: ${userId}`);

        const headers = {
            Authorization: `Bearer ${session.accessToken}`,
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
        };

        // Fetch courses
        const coursesResponse = await fetch(
            "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
            { headers }
        );

        if (!coursesResponse.ok) {
            throw new Error("Failed to fetch courses");
        }

        const coursesData = await coursesResponse.json();
        const courses: Course[] = coursesData.courses || [];

        // Fetch and process all classroom data
        const classroomData = await fetchClassroomData(headers, courses);

        // Cache the result in Vercel KV
        await setCacheData(userId, classroomData);

        return NextResponse.json(classroomData);

    } catch (error) {
        console.error("Error fetching classroom data:", error);
        return NextResponse.json(
            { error: "Failed to fetch classroom data. Please login again." },
            { status: 500 }
        );
    }
}

// Optional: POST endpoint to manually clear cache (e.g., after grade posted)
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user?.id;
        if (!userId) return NextResponse.json(
            { error: "User ID not found" },
            { status: 400 }
        );
        await clearUserCache(userId);

        return NextResponse.json({ message: "Cache cleared successfully" });
    } catch (error) {
        console.error("Error clearing cache:", error);
        return NextResponse.json(
            { error: "Failed to clear cache" },
            { status: 500 }
        );
    }
}