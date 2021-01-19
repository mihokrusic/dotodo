import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs';
import { Period, PeriodType, Task } from './interfaces';
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
        // TODO: sort tasks, first is recurring?
        console.log(result);
    }

    async add(newText: string) {
        const newTask = { ...this.currentPeriod, text: newText };
        const { id, text, done, deleted } = await this.ipc.invoke('create-task', newTask);

        const tasks = this.tasksRx.value;
        tasks.unshift({ id, text, done, deleted, taskExists: true });
        this.tasksRx.next(tasks);
    }

    async done({ id }: Task, done: boolean) {
        this.updateTaskAfterDone(id, done);
        const { error, data } = await this.ipc.invoke('check-task', { id, done });
        if (error) {
            // TODO
            alert(`Error: ${error}`);
        }
    }

    async delete({ id }: Task) {
        this.removeTaskAfterDelete(id);
        const { error, data } = await this.ipc.invoke('delete-task', { id });
        if (error) {
            // TODO
            alert(`Error: ${error}`);
        }
    }

    async update({ id }: Task, newText: string) {
        this.updateTaskAfterTextChange(id, newText);
        const { error, data } = await this.ipc.invoke('update-task', { id, text: newText });
        if (error) {
            // TODO
            alert(`Error: ${error}`);
        }
    }

    async repeatable({ id, text, recurringTaskId }: Task, repeat: boolean) {
        this.updateTaskAfterRecurringChange(id, repeat);

        const { error, data } = repeat
            ? await this.ipc.invoke('make-task-repeatable', { id, text, type: PeriodType.Daily })
            : await this.ipc.invoke('make-task-non-repeatable', { recurringTaskId });

        if (error) {
            // TODO
            alert(`Error: ${error}`);
        }
    }

    private updateTaskAfterDone(id: number, done: boolean) {
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

    private updateTaskAfterTextChange(id: number, text: string) {
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

    private updateTaskAfterRecurringChange(id: number, recurring: boolean) {
        const tasks = this.tasksRx.value.map((t) => {
            if (t.id !== id) {
                return t;
            }

            return {
                ...t,
                recurring,
            };
        });
        this.tasksRx.next(tasks);
    }

    private removeTaskAfterDelete(id: number) {
        const tasks = this.tasksRx.value.filter((t) => {
            if (t.id !== id) {
                return t;
            }
        });
        this.tasksRx.next(tasks);
    }
}
