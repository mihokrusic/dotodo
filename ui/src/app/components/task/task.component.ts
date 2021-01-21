import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from 'src/app/interfaces';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
})
export class TaskComponent implements OnInit {
    @Input() task: Task;

    @Output() update = new EventEmitter<string>();
    @Output() mark = new EventEmitter<boolean>();
    @Output() delete = new EventEmitter<void>();
    @Output() repeatable = new EventEmitter<boolean>();

    text: string = '';

    private oldText: string;

    constructor() {}

    ngOnInit(): void {
        this.text = this.task.text;
    }

    onTaskDone = () => this.mark.emit(true);
    onTaskRevert = () => this.mark.emit(false);
    onTaskDelete = () => this.delete.emit();
    onTaskDeleteThis = () => this.delete.emit();
    onTaskDeleteAll = () => this.delete.emit();
    onTaskRepeatable = () => this.repeatable.emit(true);
    onTaskNonRepeatable = () => this.repeatable.emit(false);

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
