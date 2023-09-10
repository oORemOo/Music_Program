const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        webPreferences: {
            
            nodeIntegration: true, // เปิดใช้งาน Node.js
            devTools:true,
            contextIsolation:false


        },
    });
    
 

    mainWindow.loadFile('index.html'); // เรียกใช้ไฟล์ HTML ของคุณ

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
