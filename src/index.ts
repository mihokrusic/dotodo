import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage, ipcMain } from 'electron';
import log from 'electron-log';
import { join } from 'path';
import { Sequelize } from 'sequelize/types';
import { IpcChannelInterface } from './interfaces/IPCChannelInterface';
import ipcChannelFactory from './ipc';
import { connectToDb, createService } from './models';
import { TaskService } from './services/tasks.service';
const env = process.env.NODE_ENV || 'development';

let tray: Tray = null;
let actuallyCloseApp = false;

const UI_PATH = join(__dirname, '/../ui/dist/index.html');
const ICON_PATH = join(__dirname, '/../assets/tasks.png');
const DB_PATH = join(__dirname, '/../assets/database.db');

class Main {
    private db: Sequelize;
    private taskService: TaskService;

    private mainWindow: BrowserWindow;

    async init() {
        // Connect to DB
        this.db = await connectToDb(DB_PATH, log);
        this.taskService = createService();
        this.registerIpcChannels(ipcChannelFactory(this.taskService));

        await app.whenReady();

        this.createWindow();
        this.createTrayIcon();
        this.registerShortcuts();

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
                this.createWindow();
            }
        });
    }

    private registerIpcChannels(ipcChannels: IpcChannelInterface[]) {
        ipcChannels.forEach((channel) => {
            ipcMain.handle(channel.getName(), channel.handle.bind(channel));
        });
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 700,
            height: 800,
            // frame: false,
            title: 'Do your TODOs',
            icon: nativeImage.createFromPath(ICON_PATH),
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false,
            },
        });

        this.mainWindow.setMenu(null);
        this.mainWindow.loadURL(UI_PATH);

        this.mainWindow.webContents.on('did-fail-load', () => {
            log.info('did-fail-load event: reloading app');
            this.mainWindow.loadURL(UI_PATH);
        });

        this.mainWindow.on('moved', () => {
            log.info(this.mainWindow.getPosition());
        });

        this.mainWindow.on('close', (event) => {
            if (!actuallyCloseApp) {
                // TODO: this should be under settings, "on X close or minimize to tray?"
                event.preventDefault();
                this.mainWindow.hide();
            }
        });
    }

    private createTrayIcon() {
        tray = new Tray(nativeImage.createFromPath(ICON_PATH));
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
        tray.setToolTip(BrowserWindow.getAllWindows()[0].title);
        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => BrowserWindow.getAllWindows()[0].show());
    }

    private registerShortcuts() {
        globalShortcut.register('Alt+Shift+T', () => {
            BrowserWindow.getAllWindows()[0].show();
        });

        // TODO: this should only be in dev mode
        globalShortcut.register('CommandOrControl+Shift+I', () =>
            this.mainWindow.webContents.openDevTools({ mode: 'detach' })
        );
    }
}

new Main().init();
