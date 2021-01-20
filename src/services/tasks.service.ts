import { startOfMonth, startOfWeek } from 'date-fns';
import { Op } from 'sequelize';
import { RecurringTask } from './../models/RecurringTasks';
import { Task } from './../models/Tasks';
import { PeriodType } from '../interfaces/enums';
import { convertDate } from '../utility/dates';

class TaskService {
    constructor() {}

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
        return newTask;
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

    async makeTaskRepeatable(id: number, text: string, type: PeriodType) {
        // const task = await this.db.models.Task.findByPk(id);
        // if (task.dataValues.recurringTaskId !== null) {
        //     throw new Error('Task is already a recurring task.');
        // }
        // const t = await this.db.transaction();
        // try {
        //     const newRecurringTask = await this.db.models.RecurringTask.create(
        //         {
        //             type,
        //             text,
        //         },
        //         { transaction: t }
        //     );
        //     const updatedTask = await task.update(
        //         { recurringTaskId: newRecurringTask.dataValues.id },
        //         { transaction: t }
        //     );
        //     await t.commit();
        //     return updatedTask;
        // } catch (e) {
        //     await t.rollback();
        //     throw e;
        // }
    }

    async makeTaskNonRepeatable(recurringTaskId: number) {
        // TODO: delete recurring task, update all tasks with recurringTaskId to recurringTaskId = null
        // const recurringTask = await this.db.models.RecurringTask.findByPk(recurringTaskId);
        // if (recurringTask === null) {
        //     throw new Error('Recurring task does not exist.');
        // }
        // const result = await recurringTask.delete();
        // return result;
    }
}

export default new TaskService();
