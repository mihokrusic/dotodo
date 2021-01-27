import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { SelectedPeriodService } from 'src/app/selected-period.service';
import { SubSink } from 'subsink';
import { PeriodType } from './../../../../../shared/enums';
import { Period } from './../../../../../shared/interfaces';

@Component({
    selector: 'app-period-toolbar',
    templateUrl: './period-toolbar.component.html',
})
export class PeriodToolbarComponent implements OnInit {
    currentPeriod: Period;

    subs = new SubSink();

    PeriodType = PeriodType;

    constructor(private selectedPeriodService: SelectedPeriodService) {}

    ngOnInit() {
        this.subs.sink = this.selectedPeriodService.currentPeriod$.subscribe((period) => (this.currentPeriod = period));
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    getWeekday = () => format(this.currentPeriod.startDate, 'cccc');
    getDate = () => format(this.currentPeriod.startDate, 'do MMM yyyy');
    getWeek = () =>
        `${format(this.currentPeriod.startDate, 'do MMM')} - ${format(this.currentPeriod.endDate, 'do MMM')}`;
    getMonth = () => `${format(this.currentPeriod.startDate, 'LLL yyyy')}`;

    switch(periodType: PeriodType) {
        this.selectedPeriodService.changeType(periodType);
    }

    now() {
        this.selectedPeriodService.now();
    }

    prev() {
        this.selectedPeriodService.decrementDate();
    }

    next() {
        this.selectedPeriodService.incrementDate();
    }
}
