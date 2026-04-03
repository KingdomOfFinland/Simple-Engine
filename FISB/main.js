const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Hiljennetään VA-API ja estetään GPU-sekoilut (Win7 fixit)
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
      webviewTag: true, 
      webSecurity: false
    }
  });

  // --- LATAUSLOGIIKKA ALKAA ---
  session.defaultSession.on('will-download', (event, item, webContents) => {
    // Asetetaan polku Windowsin Downloads-kansioon
    const downloadPath = path.join(process.env.USERPROFILE, 'Downloads', item.getFilename());
    item.setSavePath(downloadPath);

    console.log(`Ladataan: ${item.getFilename()} -> ${downloadPath}`);

    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Lataus keskeytetty');
        } else {
          // Voit lähettää tämän tiedon käyttöliittymään jos haluat progress barin
          console.log(`Ladattu: ${item.getReceivedBytes()} bytes`);
        }
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Lataus valmis!');
      } else {
        console.log(`Lataus epäonnistui: ${state}`);
      }
    });
  });
  // --- LATAUSLOGIIKKA PÄÄTTYY ---

  // Pakotetaan webview-oikeudet päälle
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
