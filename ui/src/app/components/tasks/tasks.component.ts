import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Task } from 'src/app/interfaces';
import { SelectedPeriodService } from 'src/app/selected-period.service';
import { SubSink } from 'subsink';
import { TasksService } from './../../tasks.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {
    tasks: Task[] = [];
    completedTasks: Task[] = [];

    subs = new SubSink();

    showCompletedTasks = false;

    constructor(
        private selectedPeriodService: SelectedPeriodService,
        private tasksService: TasksService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.subs.sink = this.tasksService.tasks$.subscribe((tasks) => {
            this.tasks = tasks.filter((t) => !t.done);
            this.completedTasks = tasks.filter((t) => t.done);
            this.cdr.detectChanges();
        });

        this.subs.sink = this.selectedPeriodService.currentPeriod$.subscribe((_) => this.tasksService.getTasks());
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    trackByFn = (_: number, item: Task) => item.id;

    showHideCompletedTasks = () => (this.showCompletedTasks = !this.showCompletedTasks);

    taskAdd(text: string) {
        try {
            this.tasksService.add(text);
        } catch (e) {
            console.error(e);
        }
    }

    taskMark(task: Task, done: boolean) {
        this.tasksService.done(task, done);
    }

    taskDelete(task: Task) {
        this.tasksService.delete(task);
    }

    taskUpdate(task: Task, newText: string) {
        this.tasksService.update(task, newText);
    }

    taskRepeatable(task: Task, repeats: boolean) {
        this.tasksService.repeatable(task, repeats);
    }
}
