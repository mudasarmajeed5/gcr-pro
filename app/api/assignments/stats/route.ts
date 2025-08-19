import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Announcement, CourseWorkMaterial } from "@/types/all-data";

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
    submission?: any;
    isOverdue?: boolean;
}

interface StudentSubmission {
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

export async function GET(_request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Optimized headers for all requests
        const headers = {
            Authorization: `Bearer ${session.accessToken}`,
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
        };

        // Fetch courses with field filtering
        const coursesResponse = await fetch(
            "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
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
                const [assignmentsResponse, submissionsResponse, announcementsResponse, courseWorkMaterialsResponse] = await Promise.all([
                    // Get assignments
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?fields=courseWork(id,title,dueDate,dueTime,maxPoints,materials(driveFile(driveFile(id,title,alternateLink)),link))&pageSize=1000`,
                        { headers }
                    ),
                    // Get ALL submissions for this course at once
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me&fields=studentSubmissions(courseWorkId,state,assignedGrade,late,submissionHistory)&pageSize=1000`,
                        { headers }
                    ),
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/announcements?fields=announcements(id,text,creationTime,materials)&pageSize=1000`, { headers }
                    ),
                    fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWorkMaterials?fields=courseWorkMaterial(id,title,description,materials,creationTime)&pageSize=1000`,
                        { headers }
                    )
                ]);
                let courseWorkMaterials = []
                let assignments = [];
                let submissions = [];
                let announcements = [];
                if (assignmentsResponse.ok) {
                    const assignmentsData = await assignmentsResponse.json();
                    assignments = assignmentsData.courseWork || [];
                }

                if (submissionsResponse.ok) {
                    const submissionsData = await submissionsResponse.json();
                    submissions = submissionsData.studentSubmissions || [];
                }
                if (announcementsResponse.ok) {
                    const materialsData = await announcementsResponse.json();
                    announcements = materialsData.announcements || [];
                }
                if (courseWorkMaterialsResponse.ok) {
                    const courseWorkMaterialData = await courseWorkMaterialsResponse.json();
                    courseWorkMaterials = courseWorkMaterialData.courseWorkMaterial || [];
                }

                return {
                    announcements,
                    courseWorkMaterials,
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

        // Process and combine all data
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

        // Process each course's data
        courseData.forEach(({ courseId, assignments, submissions, announcements, courseWorkMaterials }) => {
            // Create a map of submissions by courseWorkId for quick lookup
            const submissionMap = new Map();
            submissions.forEach((submission: StudentSubmission) => {
                submissionMap.set(submission.courseWorkId, submission);
            });
            courseWorkMaterials.forEach((rawCourseWork: any) => {
                allCourseWork.push({ ...rawCourseWork, courseId });
            })
            announcements.forEach((rawMaterial: any) => {
                allAnnouncements.push({ ...rawMaterial, courseId })
            })
            // Process each assignment
            assignments.forEach((rawAssignment: any) => {
                totalAssignments++;
                const submission = submissionMap.get(rawAssignment.id);
                const isOverdue = checkIfOverdue(rawAssignment, now);
                const assignment: Assignment = {
                    id: rawAssignment.id,
                    title: rawAssignment.title,
                    dueDate: rawAssignment.dueDate,
                    dueTime: rawAssignment.dueTime,
                    maxPoints: rawAssignment.maxPoints,
                    assignedGrade: submission?.assignedGrade,
                    submissionState: submission?.state || 'NEW',
                    late: submission?.late || false,
                    courseId,
                    submission: submission || null,
                    isOverdue
                };

                allAssignments.push(assignment);

                // Calculate stats
                if (submission) {
                    if (submission.state === 'TURNED_IN' || submission.state === 'RETURNED') {
                        turnedIn++;

                        // Only add points if graded
                        if (submission.assignedGrade !== undefined && submission.assignedGrade !== null) {
                            earnedPoints += submission.assignedGrade;
                            totalPoints += rawAssignment.maxPoints || 0;
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
        const stats: ClassroomStats = {
            totalAssignments,
            turnedIn,
            unsubmitted,
            missed,
            totalPoints: Math.round(totalPoints),
            earnedPoints: Math.round(earnedPoints * 100) / 100,
            percentage: Math.round(percentage * 10) / 10,
        };

        // Return comprehensive data
        const responseData = {
            courses,
            materials: allCourseWork,
            announcements: allAnnouncements,
            assignments: allAssignments,
            stats
        };


        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Error fetching classroom data:", error);
        return NextResponse.json(
            { error: "Failed to fetch classroom data. Please login again." },
            { status: 500 }
        );
    }
}