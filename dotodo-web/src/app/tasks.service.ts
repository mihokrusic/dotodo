import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Task {
    id: number;
    text: string;
    done: boolean;
    deleted: boolean;
}

let id = 3;

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    private tasksRx = new BehaviorSubject<Task[]>([]);
    tasks$ = this.tasksRx.asObservable();

    constructor() {
        this.tasksRx.next([
            { id: 1, text: 'Do this and that', done: false, deleted: false },
            { id: 2, text: 'Do this and that', done: false, deleted: false },
            { id: 3, text: 'Do this and that', done: false, deleted: false },
        ]);
    }

    add(text: string) {
        // TODO: backend add task
        const tasks = this.tasksRx.value;
        id = id + 1;
        tasks.push({ id, text, done: false, deleted: false });
        this.tasksRx.next(tasks);
    }

    done(task: Task) {
        // TODO: backend mark task as done
        const tasks = this.tasksRx.value.map((t) => {
            if (t.id !== task.id) {
                return t;
            }

            return {
                ...t,
                done: true,
            };
        });
        this.tasksRx.next(tasks);
    }

    revert(task: Task) {
        // TODO: backend mark task as undone
        const tasks = this.tasksRx.value.map((t) => {
            if (t.id !== task.id) {
                return t;
            }

            return {
                ...t,
                done: false,
            };
        });
        this.tasksRx.next(tasks);
    }
}
