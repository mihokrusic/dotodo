import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

@Component({
    selector: 'app-task-new',
    templateUrl: './task-new.component.html',
})
export class TaskNewComponent implements OnInit {
    @Output() add = new EventEmitter<string>();

    @ViewChild('newTask') newTaskInput: ElementRef;

    newTaskForm = this.formBuilder.group({
        text: ['', Validators.required],
    });

    constructor(private formBuilder: FormBuilder, private electronService: ElectronService) {}

    ngOnInit(): void {
        this.electronService.ipcRenderer.on('app:activate', () => {
            this.newTaskInput.nativeElement.focus();
        });
    }

    onSubmit() {
        if (!this.newTaskForm.valid) {
            return;
        }

        this.add.emit(this.newTaskForm.controls.text.value);
        this.newTaskForm.reset();
    }
}
