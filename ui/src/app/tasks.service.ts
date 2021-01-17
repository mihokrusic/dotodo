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
        const result = await this.ipc.invoke('create-task', newTask);

        const tasks = this.tasksRx.value;
        const { id, text, done, deleted } = result;
        tasks.push({ id, text, done, deleted });
        this.tasksRx.next(tasks);
    }

    async done({ id }: Task) {
        const result = await this.ipc.invoke('check-task', { id, done: true });
        this.updateTaskAfterMark(id, true);
    }

    async revert({ id }: Task) {
        const result = await this.ipc.invoke('check-task', { id, done: false });
        this.updateTaskAfterMark(id, false);
    }

    async delete({ id }: Task) {
        const result = await this.ipc.invoke('delete-task', { id });
        this.removeTaskAfterDelete(id);
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

    private removeTaskAfterDelete(id) {
        const tasks = this.tasksRx.value.filter((t) => {
            if (t.id !== id) {
                return t;
            }
        });
        this.tasksRx.next(tasks);
    }
}
