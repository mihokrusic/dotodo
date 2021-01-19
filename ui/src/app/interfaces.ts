export interface Task {
    id: number;
    text: string;
    done: boolean;
    deleted: boolean;
    recurring?: boolean;
    recurringTaskId?: number;
    taskExists?: boolean;
    updatedAt?: string;
    createdAt?: string;
}

export enum PeriodType {
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
}

export interface Period {
    type: PeriodType;
    startDate: Date;
    endDate: Date;
}
