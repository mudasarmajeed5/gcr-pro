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
    courseId?: string,
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


type SubmissionState = 'RETURNED' | 'TURNED_IN' | 'NEW' | 'CREATED'

export interface RecentAssignment {
  id: string
  title: string
  dueDate?: { year: number; month: number; day: number }
  submissionState: SubmissionState
  isOverdue?: boolean
  late?: boolean
  assignedGrade?: number
  maxPoints?: number
}


