const { app, BrowserWindow } = require('electron');

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('electron-reload')(__dirname, { ignored: [/node_modules|[/\\]\./, /database.db/] });
}

require('./communication')();

const ANGULAR_PATH = `file://${__dirname}/dotodo-web/dist/index.html`;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,
        },
    });

    win.setMenu(null);
    win.loadURL(ANGULAR_PATH);

    win.webContents.openDevTools({ mode: 'detach' });

    win.webContents.on('will-redirect', (event) => {
        console.log('will redirect');
    });

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.log(errorCode, errorDescription, validatedURL);
        console.log('on browser reload it did-fail-load and reloaded the app');
        win.loadURL(ANGULAR_PATH);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
