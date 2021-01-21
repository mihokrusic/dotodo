import { Op, Sequelize } from 'sequelize';
import { TaskRepeat } from '../models/TaskRepeat';
import { Task } from './../models/Tasks';
import { PeriodType } from '../interfaces/enums';
import { convertDate } from '../utility/dates';

export class TaskService {
    constructor(private db: Sequelize) {
        this.db = db;
    }

    async getTasks(type: PeriodType, date: Date) {
        const singleTasks = await Task.findAll({
            where: {
                type,
                date: convertDate(type, date),
                taskRepeatId: null,
            },
            order: ['done', ['createdAt', 'desc']],
            raw: true,
        });

        const repeatSingleTasks = await Task.findAll({
            where: {
                type,
                date: convertDate(type, date),
            },
            include: [
                {
                    model: TaskRepeat,
                    where: {
                        deleted: false,
                    },
                },
            ],
            raw: true,
        });

        const allSingleTasks = [...singleTasks, ...repeatSingleTasks];

        const repeatingTasks = await TaskRepeat.findAll({
            where: {
                id: {
                    [Op.notIn]: allSingleTasks.map((t) => t.taskRepeatId),
                },
                startDate: {
                    [Op.lte]: date,
                },
                endDate: {
                    [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: date,
                    },
                },
                type,
                deleted: false,
            },
            raw: true,
        });

        return [
            ...repeatingTasks.map((r) => ({ ...r, repeating: true, repeatTask: true })),
            ...allSingleTasks
                .filter((t) => !t.deleted)
                .map((t) => ({ ...t, repeating: t.taskRepeatId !== null, repeatTask: false })),
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

    async checkTask(id: number, done: boolean) {
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
}

let _taskService: TaskService = null;

export function initTaskService(db: Sequelize) {
    _taskService = new TaskService(db);
}

export function getTaskService() {
    return _taskService;
}
