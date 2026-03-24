const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// 1. Estetään rautakiihdytys (auttaa vanhan VA-API:n kanssa)
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    title: "Fish Browser v0.4.0 | Ultimate",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // --- TÄMÄ ON SE TÄRKEIN LISÄYS ---
      webviewTag: true, 
      // --------------------------------
      webSecurity: false 
    }
  });

  // Poistetaan Header-estot (varmuuden vuoksi, vaikka webview hoitaa useimmat)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders = details.responseHeaders;
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];

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
