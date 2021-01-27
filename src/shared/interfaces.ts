import { PeriodType } from './enums';

export interface Task {
    id: number;
    text: string;
    done: boolean;
    deleted: boolean;
    repeating?: boolean;
    taskRepeatId?: number;
    repeatTask?: boolean;
    updatedAt?: string;
    createdAt?: string;
}

export interface Period {
    type: PeriodType;
    startDate: Date;
    endDate: Date;
}
