const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// 🚀 Win7 & Low-End Performance Fixes
// Nämä on pakollisia, jotta selain ei "kuole" heti käynnistyksessä
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('ignore-certificate-errors'); // Ohittaa vanhat SSL-virheet

// Sallii yhteydet sivuille, vaikka Win7 varmenteet olisivat vanhoja
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function createWindow () {
  const win = new BrowserWindow({
    width: 1280, 
    height: 800,
    backgroundColor: '#000000',
    title: "Fish Browser v1.1.5 | Bluefin Ultimate",
    icon: path.join(__dirname, 'icon.ico'), // Varmista että sulla on icon.ico
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, 
      webSecurity: false,
      // Asetetaan moderni User Agent, jotta sivut eivät valita vanhasta selaimesta
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  // 🛡️ NUCLEAR ADBLOCK v3 (Enhanced)
  const adBlockList = [
    "*://*.doubleclick.net/*", "*://*.googleadservices.com/*",
    "*://*.googlesyndication.com/*", "*://*/pagead/*",
    "*://www.youtube.com/api/stats/ads*", "*://www.youtube.com/get_midroll_info*",
    "*://*.moatads.com/*", "*://*.amazon-adsystem.com/*",
    "*://googleads.g.doubleclick.net/*", "*://*.adnxs.com/*",
    "*://*.ads-twitter.com/*", "*://*.quantserve.com/*",
    "*://*.analytics.google.com/*", "*://*/*adsapi*"
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
        process.stdout.write(`Ladataan: ${item.getReceivedBytes()} tavua \r`);
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('\nValmis: ' + downloadPath);
      } else {
        console.log(`Lataus epäonnistui: ${state}`);
      }
    });
  });

  // Webview-tuki (Välilehdet)
  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.nodeIntegration = true;
    webPreferences.contextIsolation = false;
    webPreferences.webviewTag = true;
    webPreferences.webSecurity = false; // Sallii iframe-sisällöt helpommin
  });

  // Header & CSP Ohitus (Sallii kaikki sivut ja krossi-domainit)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders = details.responseHeaders;
    
    // Poistetaan estot, jotka estävät sivujen näyttämisen iframeissa/webvieweissä
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['x-frame-options'];
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

// Käynnistys
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') app.quit(); 
});
