const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { startServer } = require('./backend/app');

let mainWindow;
let serverInfo;

// Désactiver le menu par défaut (pas de File/Edit/View standard)
Menu.setApplicationMenu(null);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Charger le frontend local
  mainWindow.loadURL(`http://127.0.0.1:${serverInfo.port}`);

  // Liens externes → ouvrir dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // En dev : ouvrir DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    // Démarrer le backend Express embarqué
    serverInfo = await startServer();
    console.log(`[Electron] Backend démarré sur le port ${serverInfo.port}`);
    createWindow();
  } catch (err) {
    console.error('[Electron] Erreur de démarrage du backend:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
