const { app, BrowserWindow, globalShortcut } = require('electron');

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('electron-reload')(__dirname, { ignored: [/node_modules|[/\\]\./, /database.db/] });
}

require('./communication')();

const ANGULAR_PATH = `file://${__dirname}/dotodo-web/dist/index.html`;
let MAIN_WIN = null;

function createWindow() {
    MAIN_WIN = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Do your TODOs...',
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,
        },
    });

    MAIN_WIN.setMenu(null);
    MAIN_WIN.loadURL(ANGULAR_PATH);

    MAIN_WIN.webContents.on('will-redirect', (event) => {
        console.log('will redirect');
    });

    MAIN_WIN.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.log(errorCode, errorDescription, validatedURL);
        console.log('on browser reload it did-fail-load and reloaded the app');
        MAIN_WIN.loadURL(ANGULAR_PATH);
    });
}

app.whenReady().then(() => {
    createWindow();

    globalShortcut.register('Alt+Shift+T', () => MAIN_WIN.show());
    globalShortcut.register('CommandOrControl+Shift+I', () => MAIN_WIN.webContents.openDevTools({ mode: 'detach' }));
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
