const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// 🚀 Win7 & Low-End Performance Fixes
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-site-isolation-trials');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    backgroundColor: '#000000',
    title: "Fish Browser v1.1.5 | Bluefin Ultimate",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, 
      webSecurity: false
    }
  });

  // 🛡️ NUCLEAR ADBLOCK v3 (Network Level)
  const adBlockList = [
    "*://*.doubleclick.net/*", "*://*.googleadservices.com/*",
    "*://*.googlesyndication.com/*", "*://*/pagead/*",
    "*://www.youtube.com/api/stats/ads*", "*://www.youtube.com/get_midroll_info*",
    "*://*.moatads.com/*", "*://*.amazon-adsystem.com/*",
    "*://googleads.g.doubleclick.net/*", "*://*.adnxs.com/*",
    "*://*.ads-twitter.com/*", "*://*.quantserve.com/*"
  ];

  session.defaultSession.webRequest.onBeforeRequest({ urls: adBlockList }, (details, callback) => {
    callback({ cancel: true });
  });

  // 📥 LATAUKSET (Downloads Folder Fix)
  session.defaultSession.on('will-download', (event, item, webContents) => {
    const downloadPath = path.join(app.getPath('downloads'), item.getFilename());
    item.setSavePath(downloadPath);

    item.on('updated', (event, state) => {
      if (state === 'progressing' && !item.isPaused()) {
        console.log(`Ladataan: ${item.getReceivedBytes()} bytes`);
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') console.log('Valmis: ' + downloadPath);
    });
  });

  // Linkitys välilehtiin
  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.nodeIntegration = true;
    webPreferences.contextIsolation = false;
    webPreferences.webviewTag = true;
    webPreferences.session = session.defaultSession;
  });

  // Header & CSP Ohitus (Sallii kaikki sivut)
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
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
