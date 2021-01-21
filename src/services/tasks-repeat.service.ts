import { Sequelize } from 'sequelize';
import { TaskRepeat } from '../models/TaskRepeat';
import { Task } from './../models/Tasks';
import { PeriodType } from '../interfaces/enums';

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
