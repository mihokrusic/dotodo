const { app, ipcMain, BrowserWindow, globalShortcut } = require('electron');
const log = require('electron-log');
const path = require('path');
const Db = require('./backend/models');
const TasksService = require('./backend/services/tasks.service');
const { createWindow, createTrayIcon } = require('./backend/electron');

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('electron-reload')(__dirname, { ignored: [/node_modules|[/\\]\./, /assets|[/\\]\./] });
}

let mainWindow = null;
let tray = null;

app.whenReady().then(() => {
    const mainWindow = createWindow();

    tray = createTrayIcon(mainWindow);

    globalShortcut.register('Alt+Shift+T', () => mainWindow.show());
    globalShortcut.register('CommandOrControl+Shift+I', () => mainWindow.webContents.openDevTools({ mode: 'detach' }));
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Connect to DB
let db = null;
try {
    const dbPath = path.join(path.dirname(__filename), 'assets/database.db');
    log.info(`Trying to open db at ${dbPath}`);
    // log.info(__dirname);
    // log.info(app.getAppPath());
    db = Db(dbPath);
    db.sync({ force: false });
    log.info('Connected to db. All models are synchronized successfully.');
} catch (e) {
    log.error(e);
}

// ServiceLayer
const tasksService = new TasksService(db);

ipcMain.handle('get-tasks', async (event, arg) => {
    log.info('get-tasks');
    const tasks = await tasksService.getTasks(arg.type, arg.startDate);
    return tasks;
});

ipcMain.handle('create-task', async (event, arg) => {
    log.info('create-task');
    const task = await tasksService.insertTask(arg.type, arg.startDate, arg.text);
    return task.toJSON();
});

ipcMain.handle('check-task', async (event, arg) => {
    log.info('check-task');
    const task = await tasksService.markTask(arg.id, arg.done);
    return task.toJSON();
});

ipcMain.handle('delete-task', async (event, arg) => {
    log.info('delete-task');
    const task = await tasksService.deleteTask(arg.id);
    return task.toJSON();
});
