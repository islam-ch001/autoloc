const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
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

  // Liens externes → navigateur système ; popups internes (impression) → fenêtre Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank' || url.startsWith(`http://127.0.0.1:${serverInfo.port}`)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 900, height: 1100,
          backgroundColor: '#ffffff',
          autoHideMenuBar: true,
          webPreferences: { contextIsolation: true, nodeIntegration: false },
        },
      };
    }
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

// IPC : génération du PDF de facture
ipcMain.handle('print-invoice-pdf', async (_event, { html, invoiceNum }) => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true, javascript: false },
  });
  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await new Promise(r => setTimeout(r, 200)); // laisser les fonts se charger
    const pdf = await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: { marginType: 'custom', top: 0.6, right: 0.6, bottom: 0.6, left: 0.6 },
    });
    // Sauver dans userData/factures pour persister
    const dir = path.join(app.getPath('userData'), 'factures');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const safeName = (invoiceNum || 'facture').replace(/[^A-Za-z0-9_-]/g, '_');
    const filePath = path.join(dir, `${safeName}.pdf`);
    fs.writeFileSync(filePath, pdf);
    // Ouvrir avec le lecteur PDF par défaut du système
    shell.openPath(filePath);
    return { ok: true, filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    win.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
