if (require('electron-squirrel-startup')) {
    return;
}

const { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const log = require('electron-log');
const path = require('path');
const { connectToDb } = require('./backend/models');
const TasksService = require('./backend/services/tasks.service');
const TasksController = require('./backend/controllers/tasks.controller');
const { createWindow } = require('./backend/electron');

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('electron-reload')(__dirname, { ignored: [/node_modules|[/\\]\./, /assets|[/\\]\./] });
}

let tray = null;
let actuallyCloseApp = false;

app.whenReady().then(async () => {
    // Connect to DB
    const db = await connectToDb(path.join(__dirname, 'assets/database.db'), log);

    // Layers
    const tasksService = new TasksService(db);
    const tasksController = new TasksController(tasksService);

    // Create main window
    const mainWindow = createWindow();

    mainWindow.on('close', (event) => {
        if (!actuallyCloseApp) {
            // TODO: this should be under settings, "on X close or minimize to tray?"
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Create tray icon
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/assets/tasks.png')));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open',
            type: 'normal',
            click: () => BrowserWindow.getAllWindows()[0].show(),
        },
        { type: 'separator' },
        {
            label: 'Quit',
            type: 'normal',
            click: () => {
                actuallyCloseApp = true;
                app.quit();
            },
        },
    ]);
    tray.setToolTip(mainWindow.title);
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => BrowserWindow.getAllWindows()[0].show());

    // Register global shortcuts
    globalShortcut.register('Alt+Shift+T', () => {
        BrowserWindow.getAllWindows()[0].show();
    });

    // TODO: this should only be in dev mode
    globalShortcut.register('CommandOrControl+Shift+I', () => mainWindow.webContents.openDevTools({ mode: 'detach' }));
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    tray.destroy();
    globalShortcut.unregisterAll();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
