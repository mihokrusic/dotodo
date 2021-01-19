const { startOfMonth, startOfWeek } = require('date-fns');
const { Op } = require('sequelize');

const _getDate = (type, date) => {
    let taskDate;
    switch (type) {
        case 0:
            taskDate = date;
            break;
        case 1:
            taskDate = startOfWeek(date);
            break;
        case 2:
            taskDate = startOfMonth(date);
            break;
    }
    return taskDate;
};

class TaskService {
    constructor(db) {
        this.db = db;
    }

    async getTasks(type, date) {
        const tasks = await this.db.models.Task.findAll({
            where: {
                type,
                date: _getDate(type, date),
                deleted: false,
            },
            order: ['done', ['createdAt', 'desc']],
            raw: true,
        });
        const existingRecurringIds = tasks.map((t) => t.recurringTaskId);

        const recurringTasks = await this.db.models.RecurringTask.findAll({
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

    async insertTask(type, date, text) {
        const newTask = await this.db.models.Task.create({
            type,
            date: _getDate(type, date),
            text,
        });
        return newTask;
    }

    async markTask(id, done) {
        const task = await this.db.models.Task.findByPk(id);
        if (task === null) {
            throw new Error('Task does not exist.');
        }

        const result = await task.update({ done }, { raw: true });
        return result;
    }

    async updateTask(id, text) {
        const task = await this.db.models.Task.findByPk(id);
        if (task === null) {
            throw new Error('Task does not exist.');
        }

        const result = await task.update({ text }, { raw: true });
        return result;
    }

    async deleteTask(id, deleted) {
        const task = await this.db.models.Task.findByPk(id);
        if (task === null) {
            throw new Error('Task does not exist.');
        }

        const result = await task.update({ deleted }, { raw: true });
        return result;
    }

    async makeTaskRepeatable(id, text, type) {
        const task = await this.db.models.Task.findByPk(id);
        if (task.dataValues.recurringTaskId !== null) {
            throw new Error('Task is already a recurring task.');
        }
        const t = await this.db.transaction();
        try {
            const newRecurringTask = await this.db.models.RecurringTask.create(
                {
                    type,
                    text,
                },
                { transaction: t }
            );

            const updatedTask = await task.update(
                { recurringTaskId: newRecurringTask.dataValues.id },
                { transaction: t }
            );

            await t.commit();
            return updatedTask;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    async makeTaskNonRepeatable(recurringTaskId) {
        // TODO: delete recurring task, update all tasks with recurringTaskId to recurringTaskId = null
        // const recurringTask = await this.db.models.RecurringTask.findByPk(recurringTaskId);
        // if (recurringTask === null) {
        //     throw new Error('Recurring task does not exist.');
        // }
        // const result = await recurringTask.delete();
        // return result;
    }
}

module.exports = TaskService;
