import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { BehaviorSubject } from 'rxjs';
import { Period, PeriodType, Task } from './interfaces';
import { SelectedPeriodService } from './selected-period.service';

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    private tasksRx = new BehaviorSubject<Task[]>([]);
    tasks$ = this.tasksRx.asObservable();

    private currentPeriod: Period;

    constructor(private selectedPeriodService: SelectedPeriodService, private electronService: ElectronService) {
        this.selectedPeriodService.currentPeriod$.subscribe((period) => (this.currentPeriod = period));
    }

    async getTasks() {
        const result = await this.electronService.ipcRenderer.invoke('get-tasks', this.currentPeriod);
        this.tasksRx.next(result);
        console.log(result);

        // TODO: sort tasks, first is repeating?
    }

    async add(newText: string) {
        const newTask = { ...this.currentPeriod, text: newText };
        const {
            error,
            data: { id, text, done, deleted },
        } = await this.electronService.ipcRenderer.invoke('create-task', newTask);

        if (error) {
            alert(`Error: ${error}`);
        } else {
            const tasks = this.tasksRx.value;
            tasks.unshift({ id, text, done, deleted, repeatTask: false });
            this.tasksRx.next(tasks);
        }
    }

    async update({ id, repeatTask, taskRepeatId }: Task, newText: string) {
        const isRepeatingTask = repeatTask || taskRepeatId !== null;
        this.updateTaskAfterTextChange(id, newText);

        let result = null;
        if (!isRepeatingTask) {
            result = await this.electronService.ipcRenderer.invoke('update-task', { id, text: newText });
        } else {
            result = await this.electronService.ipcRenderer.invoke('repeat:update', {
                id: taskRepeatId ?? id,
                text: newText,
            });
        }

        if (result.error) {
            alert(`Error: ${result.error}`);
        }
    }

    async mark({ id }: Task, done: boolean) {
        // TODO: if taskExists === false, insert task and mark it?
        this.updateTaskAfterDone(id, done);
        const { error, data } = await this.electronService.ipcRenderer.invoke('check-task', { id, done });
        if (error) {
            alert(`Error: ${error}`);
        }
    }

    async delete({ id }: Task) {
        // TODO: if taskExists === false, delete repeating task and create
        this.removeTaskAfterDelete(id);
        const { error, data } = await this.electronService.ipcRenderer.invoke('delete-task', { id });
        if (error) {
            alert(`Error: ${error}`);
        }
    }

    async repeatable(task: Task, repeat: boolean) {
        this.updateTaskAfterRepeatingChange(task.id, repeat);

        const taskRepeatId = task.repeatTask ? task.id : task.taskRepeatId;

        let result = null;

        if (repeat) {
            result = await this.electronService.ipcRenderer.invoke('repeat:start', {
                id: task.id,
                text: task.text,
                type: PeriodType.Daily,
                startDate: this.currentPeriod.startDate,
            });
        } else {
            result = await this.electronService.ipcRenderer.invoke('repeat:stop', {
                taskRepeatId,
                endDate: this.currentPeriod.startDate,
            });
        }

        if (result.error) {
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

    private updateTaskAfterRepeatingChange(id: number, repeating: boolean) {
        const tasks = this.tasksRx.value.map((t) => {
            if (t.id !== id) {
                return t;
            }

            return {
                ...t,
                repeating,
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
