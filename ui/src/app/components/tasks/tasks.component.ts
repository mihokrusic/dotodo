import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { listAddRemoveTrigger } from 'src/app/animations';
import { DeleteChoice, Task } from 'src/app/interfaces';
import { SelectedPeriodService } from 'src/app/selected-period.service';
import { SubSink } from 'subsink';
import { TasksService } from './../../tasks.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    animations: [listAddRemoveTrigger],
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

    trackByFn = (_: number, item: Task) => `${item.id}-${item.taskRepeatId}`;

    showHideCompletedTasks = () => (this.showCompletedTasks = !this.showCompletedTasks);

    taskAdd(text: string) {
        try {
            this.tasksService.add(text);
        } catch (e) {
            console.error(e);
        }
    }

    taskMark = (task: Task, done: boolean) => this.tasksService.mark(task, done);
    taskDelete = (task: Task, deleteChoice: DeleteChoice) => this.tasksService.delete(task, deleteChoice);
    taskUpdate = (task: Task, newText: string) => this.tasksService.update(task, newText);
    taskRepeatable = (task: Task, repeats: boolean) => this.tasksService.repeatable(task, repeats);
}
