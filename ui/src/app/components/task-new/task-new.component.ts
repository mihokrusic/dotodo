import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-task-new',
    templateUrl: './task-new.component.html',
})
export class TaskNewComponent implements OnInit {
    @Output() add = new EventEmitter<string>();

    newTaskForm = this.formBuilder.group({
        text: ['', Validators.required],
    });

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit(): void {}

    onSubmit() {
        if (!this.newTaskForm.valid) {
            return;
        }

        this.add.emit(this.newTaskForm.controls.text.value);
        this.newTaskForm.reset();
    }
}
