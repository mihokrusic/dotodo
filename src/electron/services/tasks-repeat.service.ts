import { Sequelize } from 'sequelize';
import { TaskRepeat } from '../models/TaskRepeat';
import { Task } from './../models/Tasks';
import { PeriodType } from '../../shared/enums';
import { convertDate } from '../utility/dates';

export class TaskRepeatService {
    constructor(private db: Sequelize) {
        this.db = db;
    }

    async updateTaskRepeat(id: number, text: string) {
        const task = await TaskRepeat.findByPk(id);
        if (task === null) {
            throw new Error('Repeating task does not exist.');
        }
        await Task.update({ text }, { where: { taskRepeatId: id } });
        const result = await task.update({ text });
        return result.toJSON();
    }

    async deleteTaskRepeat(id: number, date: Date, deleted: boolean) {
        const repeatingTask = await TaskRepeat.findByPk(id);
        if (repeatingTask === null) {
            throw new Error('Repeating task does not exist.');
        }

        let result;
        if (!date) {
            result = await repeatingTask.update({ deleted });
        } else {
            result = await Task.create({
                type: repeatingTask.type,
                date: convertDate(repeatingTask.type, date),
                text: repeatingTask.text,
                taskRepeatId: repeatingTask.id,
                done: false,
                deleted: true,
            });
        }
        return result.toJSON();
    }

    async checkTaskRepeat(id: number, done: boolean, date: Date) {
        const repeatingTask = await TaskRepeat.findByPk(id);
        if (repeatingTask === null) {
            throw new Error('Repeating task does not exist.');
        }

        const newTask = await Task.create({
            type: repeatingTask.type,
            date: convertDate(repeatingTask.type, date),
            text: repeatingTask.text,
            taskRepeatId: repeatingTask.id,
            done,
        });

        return newTask.toJSON();
    }

    async repeatTask(id: number, text: string, type: PeriodType, startDate: Date) {
        const task = await Task.findByPk(id);
        if (task.taskRepeatId !== null) {
            throw new Error('Task is already a repeating task.');
        }

        const t = await this.db.transaction();
        try {
            const newTaskRepeat = await TaskRepeat.create(
                {
                    type,
                    text,
                    startDate,
                },
                { transaction: t }
            );
            const updatedTask = await task.update({ taskRepeatId: newTaskRepeat.id }, { transaction: t });
            await t.commit();

            return updatedTask.toJSON();
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    async stopRepeatingTask(taskRepeatId: number, endDate: Date) {
        const taskRepeat = await TaskRepeat.findByPk(taskRepeatId);
        if (taskRepeat === null) {
            throw new Error('Repeating task does not exist.');
        }

        const result = await taskRepeat.update({ endDate });
        return result.toJSON();
    }
}

let _taskRepeatService: TaskRepeatService = null;

export function initTaskRepeatService(db: Sequelize) {
    _taskRepeatService = new TaskRepeatService(db);
}

export function getTaskRepeatService() {
    return _taskRepeatService;
}
