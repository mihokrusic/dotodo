const { ipcMain } = require('electron');
const log = require('electron-log');

class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;

        this.registerListeners();
    }

    registerListeners() {
        ipcMain.handle('get-tasks', async (event, arg) => {
            log.info('get-tasks', JSON.stringify(arg));
            const tasks = await this.tasksService.getTasks(arg.type, arg.startDate);
            return tasks;
        });

        ipcMain.handle('create-task', async (event, arg) => {
            log.info('create-task', JSON.stringify(arg));
            const task = await this.tasksService.insertTask(arg.type, arg.startDate, arg.text);
            return task.toJSON();
        });

        ipcMain.handle('update-task', async (event, arg) => {
            log.info('update-task', JSON.stringify(arg));
            try {
                const data = await this.tasksService.updateTask(arg.id, arg.text);
                return {
                    error: null,
                    data,
                };
            } catch (e) {
                log.error(e);
                return {
                    error: e.message,
                };
            }
        });

        ipcMain.handle('check-task', async (event, arg) => {
            log.info('check-task', JSON.stringify(arg));
            try {
                const data = await this.tasksService.markTask(arg.id, arg.done);
                return {
                    error: null,
                    data,
                };
            } catch (e) {
                log.error(e);
                return {
                    error: e.message,
                };
            }
        });

        ipcMain.handle('delete-task', async (event, arg) => {
            log.info(`delete-task; ${JSON.stringify(arg)}`);
            try {
                const data = await this.tasksService.deleteTask(arg.id, true);
                return {
                    error: null,
                    data,
                };
            } catch (e) {
                log.error(e);
                return {
                    error: e.message,
                };
            }
        });

        ipcMain.handle('make-task-repeatable', async (event, arg) => {
            log.info('make-task-repeatable', arg);
            try {
                const { id, text, type } = arg;
                const data = await this.tasksService.makeTaskRepeatable(id, text, type);
                return {
                    error: null,
                    data,
                };
            } catch (e) {
                log.error(e);
                return {
                    error: e.message,
                };
            }
        });

        ipcMain.handle('make-task-non-repeatable', async (event, arg) => {
            log.info('make-task-non-repeatable', arg);
            try {
                const { recurringTaskId } = arg;
                const data = await this.tasksService.makeTaskNonRepeatable(recurringTaskId);
                return {
                    error: null,
                    data,
                };
            } catch (e) {
                log.error(e);
                return {
                    error: e.message,
                };
            }
        });
    }
}

module.exports = TasksController;
