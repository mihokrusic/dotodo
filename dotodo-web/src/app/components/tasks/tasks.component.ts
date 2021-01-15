import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { Task, TasksService } from './../../tasks.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.less'],
})
export class TasksComponent implements OnInit {
    tasks: Task[] = [];
    completedTasks: Task[] = [];

    subs = new SubSink();

    showCompletedTasks = false;

    constructor(private tasksService: TasksService) {}

    ngOnInit() {
        this.subs.sink = this.tasksService.tasks$.subscribe((tasks) => {
            this.tasks = tasks.filter((t) => !t.done);
            this.completedTasks = tasks.filter((t) => t.done);
        });
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    trackByFn = (_: number, item: Task) => item.id;

    showHideCompletedTasks = () => (this.showCompletedTasks = !this.showCompletedTasks);

    taskAdd(text: string) {
        this.tasksService.add(text);
    }

    taskDone(task: Task) {
        this.tasksService.done(task);
    }

    taskRevert(task: Task) {
        this.tasksService.revert(task);
    }
}
