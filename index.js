const { app, BrowserWindow } = require('electron');
require('electron-reload')(__dirname);

const ANGULAR_PATH = `file://${__dirname}/dotodo-web/dist/index.html`;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false,
            contextIsolation: false,
            devTools: true,
        },
    });

    win.setMenu(null);
    win.loadURL(ANGULAR_PATH);

    win.webContents.openDevTools();
    win.webContents.on('did-fail-load', () => {
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
