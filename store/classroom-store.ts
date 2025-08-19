// store/classroom-store.ts
import { Announcement, CourseWorkMaterial } from '@/types/all-data';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface ClassroomStore {
    // Data
    courses: Course[];
    assignments: Assignment[];
    stats: ClassroomStats | null;
    materials: CourseWorkMaterial[]
    announcements: Announcement[]
    // Loading states
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchClassroomData: () => Promise<void>;
    refreshData: () => Promise<void>;

    // Selectors (computed values)
    getCourseById: (courseId: string) => Course | undefined;
    getAssignmentsByCourseId: (courseId: string) => Assignment[];
    getAssignmentById: (assignmentId: string) => Assignment | undefined;
    getOverdueAssignments: () => Assignment[];
    getPendingAssignments: () => Assignment[];
    getCompletedAssignments: () => Assignment[];
    getAssignmentsByStatus: (status: Assignment['submissionState']) => Assignment[];
    getMaterialsByCourseId: (courseId: string) => CourseWorkMaterial[];
    getAnnouncementsByCourseId: (courseId: string) => Announcement[];
    // Utility methods
    isDataStale: () => boolean;
    shouldRefresh: () => boolean;

    // Reset
    reset: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000;

export const useClassroomStore = create<ClassroomStore>()(
    persist(
        (set, get) => ({
            courses: [],
            assignments: [],
            stats: null,
            isLoading: false,
            error: null,
            lastFetched: null,
            announcements: [],
            materials: [],

            // Fetch all classroom data from the unified endpoint
            fetchClassroomData: async () => {
                const state = get();

                // Don't fetch if already loading
                if (state.isLoading) return;

                // Don't fetch if data is fresh (unless forced)
                if (state.lastFetched && !state.isDataStale()) {
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const response = await fetch('/api/assignments/stats');

                    if (!response.ok) {
                        throw new Error(`Failed to fetch: ${response.statusText}`);
                    }

                    const data = await response.json();

                    set({
                        courses: data.courses || [],
                        assignments: data.assignments || [],
                        stats: data.stats || null,
                        isLoading: false,
                        error: null,
                        materials: data.materials || [],
                        announcements: data.announcements || [],
                        lastFetched: Date.now(),
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                    });
                    throw error; // Re-throw so components can handle it
                }
            },

            // Force refresh data (ignores cache)
            refreshData: async () => {
                set({ lastFetched: null }); // Reset timestamp to force refresh
                return get().fetchClassroomData();
            },

            // Get course by ID
            getCourseById: (courseId: string) => {
                return get().courses.find(course => course.id === courseId);
            },

            // Get assignments for a specific course
            getAssignmentsByCourseId: (courseId: string) => {
                return get().assignments.filter(assignment => assignment.courseId === courseId);
            },
            getMaterialsByCourseId: (courseId: string) => {
                return get().materials.filter(material => material.courseId === courseId);
            },

            getAnnouncementsByCourseId: (courseId: string) => {
                return get().announcements.filter(announcement => announcement.courseId === courseId);
            },
            // Get assignment by ID
            getAssignmentById: (assignmentId: string) => {
                return get().assignments.find(assignment => assignment.id === assignmentId);
            },

            // Get overdue assignments
            getOverdueAssignments: () => {
                return get().assignments.filter(assignment => assignment.isOverdue &&
                    !['TURNED_IN', 'RETURNED'].includes(assignment.submissionState));
            },

            // Get pending assignments (not submitted and not overdue)
            getPendingAssignments: () => {
                return get().assignments.filter(assignment =>
                    !assignment.isOverdue &&
                    !['TURNED_IN', 'RETURNED'].includes(assignment.submissionState));
            },

            // Get completed assignments
            getCompletedAssignments: () => {
                return get().assignments.filter(assignment =>
                    ['TURNED_IN', 'RETURNED'].includes(assignment.submissionState));
            },

            // Get assignments by specific status
            getAssignmentsByStatus: (status: Assignment['submissionState']) => {
                return get().assignments.filter(assignment => assignment.submissionState === status);
            },

            // Check if data is stale
            isDataStale: () => {
                const state = get();
                if (!state.lastFetched) return true;
                return Date.now() - state.lastFetched > CACHE_DURATION;
            },

            // Check if should refresh (considers loading state)
            shouldRefresh: () => {
                const state = get();
                return !state.isLoading && state.isDataStale();
            },

            // Reset store
            reset: () => {
                set({
                    courses: [],
                    assignments: [],
                    stats: null,
                    isLoading: false,
                    error: null,
                    lastFetched: null,
                    announcements: [],
                    materials: [],
                });
            },
        }),
        {
            name: 'classroom-store',
            // Only persist non-sensitive data
            partialize: (state) => ({
                courses: state.courses,
                assignments: state.assignments,
                stats: state.stats,
                lastFetched: state.lastFetched,
                announcements: state.announcements,
                materials: state.materials,
            }),
        }
    )
);