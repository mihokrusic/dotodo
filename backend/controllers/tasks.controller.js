const { ipcMain } = require('electron');
const log = require('electron-log');

class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;

        this.registerListeners();
    }

    registerListeners() {
        ipcMain.handle('get-tasks', async (event, arg) => {
            log.info('get-tasks');
            const tasks = await this.tasksService.getTasks(arg.type, arg.startDate);
            return tasks;
        });

        ipcMain.handle('create-task', async (event, arg) => {
            log.info('create-task');
            const task = await this.tasksService.insertTask(arg.type, arg.startDate, arg.text);
            return task.toJSON();
        });

        ipcMain.handle('check-task', async (event, arg) => {
            log.info('check-task');
            const task = await this.tasksService.markTask(arg.id, arg.done);
            return task.toJSON();
        });

        ipcMain.handle('delete-task', async (event, arg) => {
            log.info(`delete-task; ${JSON.stringify(arg)}`);
            const task = await this.tasksService.deleteTask(arg.id, true);
            return task.toJSON();
        });
    }
}

module.exports = TasksController;
