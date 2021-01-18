import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs';
import { Period, Task } from './interfaces';
import { SelectedPeriodService } from './selected-period.service';

let id = 3;

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    private tasksRx = new BehaviorSubject<Task[]>([]);
    tasks$ = this.tasksRx.asObservable();

    private currentPeriod: Period;
    private ipc: IpcRenderer | undefined = void 0;

    constructor(private selectedPeriodService: SelectedPeriodService) {
        if ((window as any).require) {
            try {
                this.ipc = (window as any).require('electron').ipcRenderer;
            } catch (e) {
                throw e;
            }
        } else {
            console.warn('Electron IPC was not loaded');
        }

        this.selectedPeriodService.currentPeriod$.subscribe((period) => (this.currentPeriod = period));
    }

    async getTasks() {
        const result = await this.ipc.invoke('get-tasks', this.currentPeriod);
        this.tasksRx.next(result);
    }

    async add(newText: string) {
        const newTask = { ...this.currentPeriod, text: newText };
        const { id, text, done, deleted } = await this.ipc.invoke('create-task', newTask);

        const tasks = this.tasksRx.value;
        tasks.unshift({ id, text, done, deleted });
        this.tasksRx.next(tasks);
    }

    async done({ id }: Task) {
        this.updateTaskAfterMark(id, true);
        const result = await this.ipc.invoke('check-task', { id, done: true });
    }

    async revert({ id }: Task) {
        this.updateTaskAfterMark(id, false);
        const result = await this.ipc.invoke('check-task', { id, done: false });
    }

    async delete({ id }: Task) {
        this.removeTaskAfterDelete(id);
        const result = await this.ipc.invoke('delete-task', { id });
    }

    async update({ id }: Task, newText: string) {
        this.updateTaskAfterTextChange(id, newText);
        const result = await this.ipc.invoke('update-task', { id, text: newText });
    }

    private updateTaskAfterMark(id, done) {
        const tasks = this.tasksRx.value.map((t) => {
            if (t.id !== id) {
                return t;
            }

            return {
                ...t,
                done,
            };
        });
        this.tasksRx.next(tasks);
    }

    private updateTaskAfterTextChange(id, text) {
        const tasks = this.tasksRx.value.map((t) => {
            if (t.id !== id) {
                return t;
            }

            return {
                ...t,
                text,
            };
        });
        this.tasksRx.next(tasks);
    }

    private removeTaskAfterDelete(id) {
        const tasks = this.tasksRx.value.filter((t) => {
            if (t.id !== id) {
                return t;
            }
        });
        this.tasksRx.next(tasks);
    }
}
