const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Hiljennetään VA-API ja estetään GPU-sekoilut
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-site-isolation-trials');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    title: "Fish Browser v0.4.0 | Ultimate",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, // Sallii webview-elementin
      webSecurity: false
    }
  });

  // TÄMÄ ON SE RATKAISU PÄIVITYKSEN JÄLKEEN:
  // Pakotetaan webview-oikeudet päälle kun se yrittää kiinnittyä
  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.nodeIntegration = true;
    webPreferences.contextIsolation = false;
    webPreferences.webSecurity = false;
  });

  // Poistetaan Header-estot (CORS/X-Frame)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders = details.responseHeaders;
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-security-policy'];
    callback({
      cancel: false,
      responseHeaders: {
        ...responseHeaders,
        'Access-Control-Allow-Origin': ['*']
      }
    });
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
