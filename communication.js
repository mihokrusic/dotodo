const { ipcMain } = require('electron');
const path = require('path');
const Db = require('./backend/models');
const TasksService = require('./backend/services/tasks.service');

const init = () => {
    // Connect to DB
    const db = Db(path.join(path.dirname(__filename), 'database.db'));
    db.sync({ force: false });
    console.log('All models were synchronized successfully.');

    // Initialize services
    const tasksService = new TasksService(db);

    // Communication between Angular and Electron
    ipcMain.on('get-tasks', async (event, arg) => {
        console.log('get-tasks');
        const tasks = await tasksService.getTasks(arg.type, arg.startDate);
        event.reply('get-tasks-reply', tasks);
    });

    ipcMain.on('create-task', async (event, arg) => {
        console.log('create-task');
        const task = await tasksService.insertTask(arg.type, arg.startDate, arg.text);
        event.reply('create-task-reply', task.toJSON());
    });

    ipcMain.on('check-task', async (event, arg) => {
        console.log('check-task');
        const task = await tasksService.markTask(arg.id, arg.done);
        event.reply('check-task-reply', task.toJSON());
    });

    ipcMain.on('delete-task', async (event, arg) => {
        console.log('delete-task');
        const task = await tasksService.deleteTask(arg.id);
        event.reply('delete-task-reply', task.toJSON());
    });
};

module.exports = init;
