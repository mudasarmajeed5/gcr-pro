export interface Announcement {
    id: string;
    text: string;
    creationTime: string;
    courseId?: string
    materials?: {
        driveFile?: {
            driveFile: {
                id: string;
                title: string;
                alternateLink: string;
            };
            shareMode: 'VIEW' | 'EDIT';
        };
        link?: {
            url: string;
            title: string;
            thumbnailUrl?: string;
        };
        youtubeVideo?: {
            id: string;
            title: string;
            alternateLink: string;
            thumbnailUrl?: string;
        };
        form?: {
            formUrl: string;
            responseUrl?: string;
            title: string;
            thumbnailUrl?: string;
        };
    }[]
}

export interface CourseWorkMaterial {
    id: string;
    title: string;
    courseId: string;
    description?: string;
    creationTime: string;
    materials?: {
        driveFile?: {
            driveFile: {
                id: string;
                title: string;
                alternateLink: string;
            };
            shareMode: 'VIEW' | 'EDIT';
        };
        link?: {
            url: string;
            title: string;
            thumbnailUrl?: string;
        };
        youtubeVideo?: {
            id: string;
            title: string;
            alternateLink: string;
            thumbnailUrl?: string;
        };
        form?: {
            formUrl: string;
            responseUrl?: string;
            title: string;
            thumbnailUrl?: string;
        };
    }[]
}



export interface StoreAssignment {
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
    materials?: {
        driveFile?: {
            driveFile: {
                id: string;
                title: string;
                alternateLink: string;
            };
            shareMode: 'VIEW' | 'EDIT';
        };
        link?: {
            url: string;
            title: string;
            thumbnailUrl?: string;
        };
        youtubeVideo?: {
            id: string;
            title: string;
            alternateLink: string;
            thumbnailUrl?: string;
        };
        form?: {
            formUrl: string;
            responseUrl?: string;
            title: string;
            thumbnailUrl?: string;
        };
    }[]
}

export interface ClassroomStats {
    totalAssignments: number;
    turnedIn: number;
    unsubmitted: number;
    missed: number;
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
}

export interface Course {
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
export interface Material {
    driveFile?: {
        driveFile: {
            id: string;
            title: string;
            alternateLink: string;
        };
        shareMode: 'VIEW' | 'EDIT';
    };
    link?: {
        url: string;
        title: string;
        thumbnailUrl?: string;
    };
    youtubeVideo?: {
        id: string;
        title: string;
        alternateLink: string;
        thumbnailUrl?: string;
    };
    form?: {
        formUrl: string;
        responseUrl?: string;
        title: string;
        thumbnailUrl?: string;
    };
}[]