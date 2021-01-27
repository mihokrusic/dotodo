import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage, ipcMain, ipcRenderer } from 'electron';
import log from 'electron-log';
import * as isDev from 'electron-is-dev';
import { join } from 'path';
import { IpcChannelInterface } from './electron/interfaces/IPCChannelInterface';
import ipcChannelFactory from './electron/ipc';
import { connectToDb } from './electron/models';
import { initTaskService } from './electron/services/tasks.service';
import { initTaskRepeatService } from './electron/services/tasks-repeat.service';
import { initSettingsService, SettingsService } from './electron/services/settings.service';
import { SettingCode } from './electron/models/Settings';

let tray: Tray = null;
let actuallyCloseApp = false;

const UI_PATH = join(__dirname, '/ui/index.html');
const ICON_PATH = join(__dirname, '/assets/tasks.png');
const DB_PATH = isDev ? join(__dirname, '/../database.db') : join(app.getPath('userData'), 'database.db');

if (isDev) {
    require('electron-reload')(join(__dirname, '/ui'));
}

class Main {
    private mainWindow: BrowserWindow;

    private settings: SettingsService;

    async init() {
        log.info('Starting app');
        // Connect to DB
        const db = await connectToDb(DB_PATH, log);
        initTaskService(db);
        initTaskRepeatService(db);
        this.settings = initSettingsService(db);
        this.registerIpcChannels(ipcChannelFactory());

        log.info('Registered services and channels');

        await app.whenReady();

        log.info('App is ready');

        await this.createWindow();
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

    private async createWindow() {
        const windowSize = await this.settings.getSize();
        const windowPosition = await this.settings.getPosition();

        this.mainWindow = new BrowserWindow({
            width: windowSize ? windowSize[0] : 600,
            height: windowSize ? windowSize[1] : 800,
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

        if (windowPosition) {
            this.mainWindow.setPosition(windowPosition[0], windowPosition[1]);
        }

        this.mainWindow.setMenu(null);
        this.mainWindow.loadURL(UI_PATH);

        this.mainWindow.webContents.on('did-fail-load', (e) => {
            log.info(e.target);
            // log.info('did-fail-load event: reloading app');
            this.mainWindow.loadURL(UI_PATH);
        });

        this.mainWindow.on('moved', () => {
            log.info('moved', this.mainWindow.getPosition());
            this.settings.saveSetting(SettingCode.WindowPosition, this.mainWindow.getPosition().map(String).join(','));
        });

        this.mainWindow.on('resized', () => {
            log.info('resized', this.mainWindow.getPosition());
            this.settings.saveSetting(SettingCode.WindowSize, this.mainWindow.getSize().map(String).join(','));
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
                click: () => this.showMainWindow(),
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
        tray.on('double-click', () => this.showMainWindow());
    }

    private registerShortcuts() {
        globalShortcut.register('Alt+Shift+T', () => this.showMainWindow());

        if (isDev) {
            globalShortcut.register('CommandOrControl+Shift+I', () =>
                this.mainWindow.webContents.openDevTools({ mode: 'detach' })
            );
        }
    }

    private showMainWindow() {
        const mainWindow = BrowserWindow.getAllWindows()[0];

        // if (!mainWindow.isVisible) {
        mainWindow.webContents.send('app:activate');
        BrowserWindow.getAllWindows()[0].show();
        // }
    }
}

new Main().init();
