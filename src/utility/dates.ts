import { startOfMonth, startOfWeek } from 'date-fns';
import { PeriodType } from 'src/interfaces/enums';

export const convertDate = (type: PeriodType, date: Date) => {
    let taskDate;
    switch (type) {
        case 0:
            taskDate = date;
            break;
        case 1:
            taskDate = startOfWeek(date);
            break;
        case 2:
            taskDate = startOfMonth(date);
            break;
    }
    return taskDate;
};
