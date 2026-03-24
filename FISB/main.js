const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Yritetään hiljentää VA-API ja pakottaa GPU päälle jos mahdollista
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
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
      webviewTag: true, // TÄRKEÄ!
      webSecurity: false 
    }
  });

  // Poistetaan estot lennosta
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders = details.responseHeaders;
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-security-policy'];
    callback({ cancel: false, responseHeaders: { ...responseHeaders, 'Access-Control-Allow-Origin': ['*'] } });
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
