import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from 'src/app/tasks.service';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.less'],
})
export class TaskComponent implements OnInit {
    @Input() task: Task;

    @Output() done = new EventEmitter<Task>();
    @Output() revert = new EventEmitter<Task>();

    constructor() {
        console.log('Task component constructor');
    }

    ngOnInit(): void {}

    onTaskDone() {
        this.done.emit(this.task);
    }

    onTaskRevert() {
        this.revert.emit(this.task);
    }
}
