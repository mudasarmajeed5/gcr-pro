
export const getStatusText = (status: string) => {
    switch (status) {
        case 'TURNED_IN': return 'Submitted';
        case 'RETURNED': return 'Graded';
        case 'NEW':
        case 'CREATED': return 'Assigned';
        default: return status;
    }
};

export const getStatusVariant = (status: string) => {
    switch (status) {
        case 'TURNED_IN': return 'default';
        case 'RETURNED': return 'secondary';
        case 'NEW':
        case 'CREATED': return 'outline';
        default: return 'secondary';
    }
};
