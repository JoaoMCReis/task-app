export interface Task {
    id: string;
    title: string;
    description: string;
    status: number; // 0 = pending, 1 = in-progress, 2 = done
    createdById: string;
    assignedToId?: string;
    createdBy?: any;
    assignedTo?: any;
    createdAt?: string;
    updatedAt?: string;
}