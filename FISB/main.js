const { app, BrowserWindow, session } = require('electron');
const path = require('path'); // Lisää tämä rivi!

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage'); // Se muistifiksaus
app.commandLine.appendSwitch('no-sandbox');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false 
    }
  });

  // Tämä varmistaa, että polku on oikea riippumatta siitä, mistä ajat komennon
  win.loadFile(path.join(__dirname, 'index.html')); 
  
  win.setMenuBarVisibility(false);

  // iFrame-estojen poisto (sama kuin ennen)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders = details.responseHeaders;
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    callback({ cancel: false, responseHeaders: { ...responseHeaders, 'Access-Control-Allow-Origin': ['*'] } });
  });
}

app.whenReady().then(createWindow);
