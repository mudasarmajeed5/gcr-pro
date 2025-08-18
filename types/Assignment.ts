export interface Assignment {
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
