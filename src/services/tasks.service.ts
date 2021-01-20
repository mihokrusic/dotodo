import { Op, Sequelize } from 'sequelize';
import { RecurringTask } from './../models/RecurringTasks';
import { Task } from './../models/Tasks';
import { PeriodType } from '../interfaces/enums';
import { convertDate } from '../utility/dates';

export class TaskService {
    constructor(private db: Sequelize) {
        this.db = db;
    }

    async getTasks(type: PeriodType, date: Date) {
        const tasks = await Task.findAll({
            where: {
                type,
                date: convertDate(type, date),
                deleted: false,
            },
            order: ['done', ['createdAt', 'desc']],
            raw: true,
        });
        const existingRecurringIds = tasks.map((t) => t.recurringTaskId);

        const recurringTasks = await RecurringTask.findAll({
            where: {
                id: {
                    [Op.notIn]: existingRecurringIds,
                },
                startDate: {
                    [Op.lte]: date,
                },
                endDate: {
                    [Op.gte]: date,
                },
                type,
                deleted: false,
            },
            raw: true,
        });

        return [
            ...recurringTasks.map((r) => ({ ...r, recurring: true, taskExists: false })),
            ...tasks.map((t) => ({ ...t, recurring: t.recurringTaskId !== null, taskExists: true })),
        ];
    }

    async insertTask(type: PeriodType, date: Date, text: string) {
        const newTask = await Task.create({
            type,
            date: convertDate(type, date),
            text,
        });
        return newTask.toJSON();
    }

    async markTask(id: number, done: boolean) {
        const task = await Task.findByPk(id);
        if (task === null) {
            throw new Error('Task does not exist.');
        }
        const result = await task.update({ done });
        return result.toJSON();
    }

    async updateTask(id: number, text: string) {
        const task = await Task.findByPk(id);
        if (task === null) {
            throw new Error('Task does not exist.');
        }
        const result = await task.update({ text });
        return result.toJSON();
    }

    async deleteTask(id: number, deleted: boolean) {
        const task = await Task.findByPk(id);
        if (task === null) {
            throw new Error('Task does not exist.');
        }
        const result = await task.update({ deleted });
        return result.toJSON();
    }

    async repeatTask(id: number, text: string, type: PeriodType, startDate: Date) {
        const task = await Task.findByPk(id);
        if (task.recurringTaskId !== null) {
            throw new Error('Task is already a recurring task.');
        }

        const t = await this.db.transaction();
        try {
            const newRecurringTask = await RecurringTask.create(
                {
                    type,
                    text,
                    startDate,
                },
                { transaction: t }
            );
            const updatedTask = await task.update({ recurringTaskId: newRecurringTask.id }, { transaction: t });
            await t.commit();

            return updatedTask.toJSON();
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    async stopRepeatingTask(recurringTaskId: number, endDate: Date) {
        const recurringTask = await RecurringTask.findByPk(recurringTaskId);
        if (recurringTask === null) {
            throw new Error('Recurring task does not exist.');
        }

        const result = await recurringTask.update({ endDate });
        return result.toJSON();
    }
}

let _taskService: TaskService = null;

export function initTaskService(db: Sequelize) {
    _taskService = new TaskService(db);
}

export function getTaskService() {
    return _taskService;
}
