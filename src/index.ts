import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage, ipcMain } from 'electron';
import log from 'electron-log';
import * as isDev from 'electron-is-dev';
import { join } from 'path';
import { IpcChannelInterface } from './interfaces/IPCChannelInterface';
import ipcChannelFactory from './ipc';
import { connectToDb } from './models';
import { initTaskService } from './services/tasks.service';
import { initTaskRepeatService } from './services/tasks-repeat.service';

let tray: Tray = null;
let actuallyCloseApp = false;

const UI_PATH = join(__dirname, '/../ui/dist/index.html');
const ICON_PATH = join(__dirname, '/../assets/tasks.png');
const DB_PATH = isDev ? join(__dirname, '/../database.db') : join(app.getPath('userData'), 'database.db');

if (isDev) {
    require('electron-reload')(join(__dirname, '/../ui'), { ignored: [/node_modules|[/\\]\./, /assets|[/\\]\./] });
}

class Main {
    private mainWindow: BrowserWindow;

    async init() {
        log.info('Starting app');
        // Connect to DB
        const db = await connectToDb(DB_PATH, log);
        initTaskService(db);
        initTaskRepeatService(db);
        this.registerIpcChannels(ipcChannelFactory());

        log.info('Registered services and channels');

        await app.whenReady();

        log.info('App is ready');

        this.createWindow();
        this.createTrayIcon();
        this.registerShortcuts();

        log.info('Window created; tray created; shortcuts registered');

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
            width: 600,
            height: 800,
            // frame: false,
            title: 'Do your TODOs',
            icon: nativeImage.createFromPath(ICON_PATH),
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false,
                enableRemoteModule: true,
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

        this.mainWindow.on('minimize', () => {
            this.mainWindow.hide();
        });

        this.mainWindow.on('close', (event) => {
            // TODO: settings, "on X close or minimize to tray?"
            // Right now, we'll just close it when users press X
            // if (!actuallyCloseApp) {
            //     event.preventDefault();
            //     this.mainWindow.hide();
            // }
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

        if (isDev) {
            globalShortcut.register('CommandOrControl+Shift+I', () =>
                this.mainWindow.webContents.openDevTools({ mode: 'detach' })
            );
        }
    }
}

new Main().init();
