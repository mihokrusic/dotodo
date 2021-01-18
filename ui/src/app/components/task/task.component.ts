import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from 'src/app/interfaces';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.less'],
})
export class TaskComponent implements OnInit {
    @Input() task: Task;

    @Output() update = new EventEmitter<string>();
    @Output() done = new EventEmitter<Task>();
    @Output() revert = new EventEmitter<Task>();
    @Output() delete = new EventEmitter<Task>();

    text: string = '';

    private oldText: string;

    constructor() {}

    ngOnInit(): void {
        this.text = this.task.text;
    }

    onTaskDone = () => this.done.emit(this.task);
    onTaskRevert = () => this.revert.emit(this.task);
    onTaskDelete = () => this.delete.emit(this.task);

    onEscape() {
        this.text = this.oldText;
    }

    onFocus() {
        this.oldText = this.text;
    }

    onBlur() {
        if (this.text !== this.oldText) {
            this.update.emit(this.text);
        }
    }
}
