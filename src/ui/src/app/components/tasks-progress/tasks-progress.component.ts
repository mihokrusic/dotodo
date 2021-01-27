import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Task } from './../../../../../shared/interfaces';

@Component({
    selector: 'app-tasks-progress',
    templateUrl: './tasks-progress.component.html',
    styleUrls: ['./tasks-progress.component.less'],
})
export class TasksProgressComponent implements OnInit {
    @Input() tasks: Task[] = [];
    @Input() completedTasks: Task[] = [];

    percentage: number = 0;

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges) {
        if (this.tasks.length === 0 && this.completedTasks.length === 0) {
            this.percentage = 0;
        } else {
            this.percentage = Math.round(
                (this.completedTasks.length / (this.tasks.length + this.completedTasks.length)) * 100
            );
        }
    }
}
