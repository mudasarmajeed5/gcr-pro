import { type Assignment } from "@/types/Assignment";
export const formatDueDate = (assignment: Assignment) => {
        if (!assignment.dueDate) return null;
        
        const date = new Date(
            assignment.dueDate.year,
            assignment.dueDate.month - 1,
            assignment.dueDate.day
        );
        
        if (assignment.dueTime) {
            date.setHours(assignment.dueTime.hours || 0);
            date.setMinutes(assignment.dueTime.minutes || 0);
        }
        
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }