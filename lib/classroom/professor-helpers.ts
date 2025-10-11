export interface Professor {
    courseId: string;
    courseName: string;
    id: string;
    name: string;
    email: string;
}

export function generateEmailFromName(fullName: string): string {
    if (!fullName) return "unknown@students.au.edu.pk";

    let parts = fullName.trim().toLowerCase().split(/\s+/);

    // Remove prefixes like Mr, Ms, Mrs, Dr, Prof
    const prefixes = ["mr", "mr.", "ms.", "ms", "mrs", "dr", "dr.", "prof", "sir", "madam", "muhammad"];
    if (prefixes.includes(parts[0])) {
        parts = parts.slice(1);
    }

    // Common middle name connectors to skip
    const middleConnectors = ["ul", "al", "bin", "bint", "ibn", "binte", "uz", "ud"];

    if (parts.length === 1) {
        // Only one name: firstname@students.au.edu.pk
        return `${parts[0]}@students.au.edu.pk`;
    }

    if (parts.length === 2) {
        // Two names: firstname.lastname@students.au.edu.pk
        return `${parts[0]}.${parts[1]}@students.au.edu.pk`;
    }

    if (parts.length >= 3) {
        // Check if there's a connector in the middle parts
        const middleParts = parts.slice(1, -1); // Get all middle parts except first and last
        const hasConnector = middleParts.some(part => middleConnectors.includes(part));

        if (hasConnector) {
            // If connector found: use first and last name
            // Example: "anwaar ul hassan" -> "anwaar.hassan@students.au.edu.pk"
            const firstName = parts[0];
            const lastName = parts[parts.length - 1];
            return `${firstName}.${lastName}@students.au.edu.pk`;
        } else {
            // No connector: use first and second name
            // Example: "ayesha sattar chaudhry" -> "ayesha.sattar@students.au.edu.pk"
            return `${parts[0]}.${parts[1]}@students.au.edu.pk`;
        }
    }

    return "unknown@students.au.edu.pk";
}

export async function fetchCourseProfessors(
    courseId: string,
    courseName: string,
    headers: Record<string, string>
): Promise<Professor[]> {
    try {
        const response = await fetch(
            `https://classroom.googleapis.com/v1/courses/${courseId}/teachers?fields=teachers(userId,profile)&pageSize=100`,
            { headers }
        );

        if (!response.ok) {
            console.warn(`Failed to fetch teachers for course ${courseId}`);
            return [];
        }

        const data = await response.json();
        const teachers = data.teachers || [];

        return teachers.map((teacher: { userId?: string; profile?: { name?: { fullName?: string } } }) => {
            const fullName = teacher.profile?.name?.fullName ?? "Unknown";
            return {
                courseId,
                courseName,
                id: teacher.userId ?? "",
                name: fullName,
                email: generateEmailFromName(fullName),
            };
        });
    } catch (error) {
        console.warn(`Error fetching teachers for course ${courseId}:`, error);
        return [];
    }
}
