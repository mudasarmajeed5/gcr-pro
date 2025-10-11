interface DateInfo {
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

export function checkIfOverdue(assignment: DateInfo, currentDate: Date): boolean {
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
