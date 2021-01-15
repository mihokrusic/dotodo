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

        this.registerListeners();
    }

    getTasks() {
        this.ipc.send('get-tasks', this.currentPeriod);
    }

    add(text: string) {
        const newTask = { ...this.currentPeriod, text };
        this.ipc.send('create-task', newTask);
    }

    done({ id }: Task) {
        this.ipc.send('check-task', { id, done: true });
        this.updateTaskAfterMark(id, true);
    }

    revert({ id }: Task) {
        this.ipc.send('check-task', { id, done: false });
        this.updateTaskAfterMark(id, false);
    }

    delete({ id }: Task) {
        this.ipc.send('delete-task', { id });
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

    private registerListeners() {
        this.ipc.on('get-tasks-reply', (event, arg) => {
            this.tasksRx.next(arg);
        });

        this.ipc.on('create-task-reply', (event, arg) => {
            const tasks = this.tasksRx.value;
            const { id, text, done, deleted } = arg;
            tasks.push({ id, text, done, deleted });
            this.tasksRx.next(tasks);
        });

        // TODO: right now, we're updating immediately after user action; not waiting for reply
        // this.ipc.on('check-task-reply', (event, arg) => {});
        // this.ipc.on('delete-task-reply', (event, arg) => {});
    }
}
