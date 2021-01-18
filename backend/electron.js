const { BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const log = require('electron-log');

const ANGULAR_PATH = path.join(__dirname, '/../ui/dist/index.html');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 700,
        height: 800,
        // frame: false,
        title: 'Do your TODOs',
        icon: nativeImage.createFromPath(path.join(__dirname, '/../assets/tasks.png')),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,
        },
    });

    mainWindow.setMenu(null);
    mainWindow.loadURL(ANGULAR_PATH);

    mainWindow.webContents.on('did-fail-load', () => {
        log.info('did-fail-load event: reloading app');
        mainWindow.loadURL(ANGULAR_PATH);
    });

    mainWindow.on('moved', (event) => {
        log.info(mainWindow.getPosition());
    });

    return mainWindow;
}

module.exports = {
    createWindow,
};
