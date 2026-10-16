const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

// Log certificate failures, but keep TLS certificate validation enabled.
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  console.error('[CERT ERROR]', {
    url,
    error,
    issuer: certificate && certificate.issuer,
    subject: certificate && certificate.subject,
    validFrom: certificate && certificate.validStart,
    validTo: certificate && certificate.validExpiry
  });
  callback(false);
});

// Hardware acceleration is enabled by default. This asks Chromium to try
// GPUs that might otherwise be blocked; remove this switch if the old driver
// causes visual glitches or crashes.
app.commandLine.appendSwitch('ignore-gpu-blocklist');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    title: 'Fish Browser v2 | Bluefin Ultimate',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.on('did-fail-load', (event, code, description, url) => {
    if (code !== -3) console.error('[LOAD ERROR]', code, description, url);
  });

  mainWindow.on('page-title-updated', (event) => event.preventDefault());
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.on('toggle-browser-devtools', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.webContents.isDevToolsOpened()) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools();
  }
});

app.whenReady().then(() => {
  session.defaultSession.on('will-download', (event, item) => {
    const filePath = path.join(app.getPath('downloads'), item.getFilename());
    item.setSavePath(filePath);

    item.on('updated', (event, state) => {
      if (state === 'interrupted') console.error('Lataus keskeytyi');
    });

    item.once('done', (event, state) => {
      if (state === 'completed') console.log('Lataus valmis: ' + filePath);
      else console.error('Lataus epäonnistui: ' + state);
    });
  });

  console.log('[GPU feature status]', app.getGPUFeatureStatus());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
