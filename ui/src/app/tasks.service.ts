import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { BehaviorSubject } from 'rxjs';
import { DeleteChoice, Period, PeriodType, Task } from './interfaces';
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
        const result = await this.electronService.ipcRenderer.invoke('task:get', this.currentPeriod);
        this.tasksRx.next(result);
        // TODO: sort tasks, first is repeating, or sort by updatedAt, or just leave it as createdat since thats how keep does it?
    }

    async add(newText: string) {
        const newTask = { ...this.currentPeriod, text: newText };
        const {
            error,
            data: { id, text, done, deleted },
        } = await this.electronService.ipcRenderer.invoke('task:create', newTask);

        if (error) {
            alert(`Error: ${error}`);
        } else {
            const tasks = this.tasksRx.value;
            tasks.unshift({ id, text, done, deleted, repeatTask: false, taskRepeatId: null });
            this.tasksRx.next(tasks);
        }
    }

    async update({ id, repeatTask, taskRepeatId }: Task, newText: string) {
        this.updateTaskAfterTextChange(id, newText);
        let result = null;
        const isRepeatingOrLinkedToRepeatingTask = repeatTask || taskRepeatId !== null;
        if (!isRepeatingOrLinkedToRepeatingTask) {
            result = await this.electronService.ipcRenderer.invoke('task:update', { id, text: newText });
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

    async mark({ id, repeatTask }: Task, done: boolean) {
        this.updateTaskAfterDone(id, done);

        let result = null;
        const isRepeatingTask = repeatTask;
        if (!isRepeatingTask) {
            result = await this.electronService.ipcRenderer.invoke('task:check', { id, done });
        } else {
            result = await this.electronService.ipcRenderer.invoke('repeat:check', {
                id,
                done,
                date: this.currentPeriod.startDate,
            });
        }

        if (result.error) {
            alert(`Error: ${result.error}`);
        }
    }

    async delete({ id, taskRepeatId }: Task, deleteChoice: DeleteChoice) {
        this.removeTaskAfterDelete(id);

        let result = null;
        if (deleteChoice !== DeleteChoice.RepeatAll) {
            result = await this.electronService.ipcRenderer.invoke('task:delete', { id });
        } else {
            result = await this.electronService.ipcRenderer.invoke('repeat:delete', { id: taskRepeatId ?? id });
        }

        if (result.error) {
            alert(`Error: ${result.error}`);
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
