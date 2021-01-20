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
    }

    async add(newText: string) {
        const newTask = { ...this.currentPeriod, text: newText };
        const {
            error,
            data: { id, text, done, deleted },
        } = await this.ipc.invoke('create-task', newTask);

        if (error) {
            // TODO:
            alert(`Error: ${error}`);
        } else {
            const tasks = this.tasksRx.value;
            tasks.unshift({ id, text, done, deleted, taskExists: true });
            this.tasksRx.next(tasks);
        }
    }

    async done({ id }: Task, done: boolean) {
        // TODO: if taskExists === false, insert task and mark it?
        this.updateTaskAfterDone(id, done);
        const { error, data } = await this.ipc.invoke('check-task', { id, done });
        if (error) {
            // TODO:
            alert(`Error: ${error}`);
        }
    }

    async delete({ id }: Task) {
        // TODO: if taskExists === false, delete recurring task and create
        this.removeTaskAfterDelete(id);
        const { error, data } = await this.ipc.invoke('delete-task', { id });
        if (error) {
            // TODO:
            alert(`Error: ${error}`);
        }
    }

    async update({ id }: Task, newText: string) {
        // TODO: if taskExists === false, update recurring task
        this.updateTaskAfterTextChange(id, newText);
        const { error, data } = await this.ipc.invoke('update-task', { id, text: newText });
        if (error) {
            // TODO:
            alert(`Error: ${error}`);
        }
    }

    async repeatable(task: Task, repeat: boolean) {
        this.updateTaskAfterRecurringChange(id, repeat);

        const recurringTaskId = task.taskExists ? task.recurringTaskId : task.id;

        let result = null;

        if (repeat) {
            result = await this.ipc.invoke('repeat-task', {
                id: task.id,
                text: task.text,
                type: PeriodType.Daily,
                startDate: this.currentPeriod.startDate,
            });
        } else {
            result = await this.ipc.invoke('repeat-task-stop', {
                recurringTaskId,
                endDate: this.currentPeriod.startDate,
            });
        }

        if (result.error) {
            // TODO:
            alert(`Error: ${result.error}`);
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
