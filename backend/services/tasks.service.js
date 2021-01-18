const { startOfMonth, startOfWeek } = require('date-fns');

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
        const results = await this.db.models.Task.findAll({
            where: {
                type,
                date: _getDate(type, date),
                deleted: false,
            },
            order: ['done', ['createdAt', 'desc']],
            raw: true,
        });

        return results;
    }

    async markTask(id, done) {
        const item = await this.db.models.Task.findByPk(id);

        const result = await item.update({ done });
        return result;
    }

    async deleteTask(id, deleted) {
        const item = await this.db.models.Task.findByPk(id);

        const result = await item.update({ deleted });
        return result;
    }

    async insertTask(type, date, text) {
        const newItem = await this.db.models.Task.create({
            type,
            date: _getDate(type, date),
            text,
        });
        return newItem;
    }

    async updateTask(id, text) {
        const item = await this.db.models.Task.findByPk(id);
        const result = await item.update({ text });
        return result;
    }
}

module.exports = TaskService;
