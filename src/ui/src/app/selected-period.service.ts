import { Injectable } from '@angular/core';
import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { PeriodType } from './../../../shared/enums';
import { Period } from './../../../shared/interfaces';

const initialPeriod: Period = {
    type: PeriodType.Daily,
    startDate: new Date(),
    endDate: new Date(),
};

@Injectable({
    providedIn: 'root',
})
export class SelectedPeriodService {
    private currentPeriodRx = new BehaviorSubject<Period>(initialPeriod);
    currentPeriod$ = this.currentPeriodRx.asObservable();

    constructor() {}

    changeType(newType: PeriodType) {
        const newPeriod = {
            ...this.currentPeriodRx.value,
            type: newType,
        } as Period;

        switch (newType) {
            case PeriodType.Daily:
                newPeriod.endDate = newPeriod.startDate;
                break;
            case PeriodType.Weekly:
                newPeriod.startDate = startOfWeek(newPeriod.startDate);
                newPeriod.endDate = endOfWeek(newPeriod.startDate);
                break;
            case PeriodType.Monthly:
                newPeriod.startDate = startOfMonth(newPeriod.startDate);
                newPeriod.endDate = endOfMonth(newPeriod.startDate);
                break;
        }

        newPeriod.endDate = this.setEndDate(newPeriod.type, newPeriod.startDate);
        this.currentPeriodRx.next(newPeriod);
    }

    now() {
        const newPeriod = {
            ...this.currentPeriodRx.value,
        } as Period;

        switch (newPeriod.type) {
            case PeriodType.Daily:
                newPeriod.startDate = new Date();
                break;
            case PeriodType.Weekly:
                newPeriod.startDate = startOfWeek(new Date());
                break;
            case PeriodType.Monthly:
                newPeriod.startDate = startOfMonth(new Date());
                break;
        }

        newPeriod.endDate = this.setEndDate(newPeriod.type, newPeriod.startDate);
        this.currentPeriodRx.next(newPeriod);
    }

    decrementDate() {
        this.incDecDate(-1);
    }

    incrementDate() {
        this.incDecDate(1);
    }

    private incDecDate(amount: number) {
        const newPeriod = {
            ...this.currentPeriodRx.value,
        } as Period;

        switch (newPeriod.type) {
            case PeriodType.Daily:
                newPeriod.startDate = addDays(newPeriod.startDate, amount);
                break;
            case PeriodType.Weekly:
                newPeriod.startDate = addWeeks(newPeriod.startDate, amount);
                break;
            case PeriodType.Monthly:
                newPeriod.startDate = addMonths(newPeriod.startDate, amount);
                break;
        }

        newPeriod.endDate = this.setEndDate(newPeriod.type, newPeriod.startDate);
        this.currentPeriodRx.next(newPeriod);
    }

    private setEndDate(periodType: PeriodType, startDate: Date) {
        if (periodType === PeriodType.Daily) {
            return startDate;
        }
        if (periodType === PeriodType.Weekly) {
            return endOfWeek(startDate);
        }
        if (periodType === PeriodType.Monthly) {
            return endOfMonth(startDate);
        }
    }
}
