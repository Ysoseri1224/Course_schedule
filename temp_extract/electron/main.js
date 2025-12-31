const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, getDatabase } = require('./database/connection');
const { registerIpcHandlers } = require('./ipc/handlers');
const { createMenu } = require('./menu');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../resources/icon.png'),
  });

  // 开发模式：优先检查Vite服务器
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // 注释掉自动打开开发者工具
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await initDatabase();
  
  registerIpcHandlers();
  
  createMenu();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const db = getDatabase();
    if (db) db.close();
    app.quit();
  }
});
