import {app, BrowserWindow, session, shell} from 'electron'

function createWindow () {
  const win = new BrowserWindow({
    show: false,
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    },
  });
  
  win.loadFile('dist/index.html');
  
  win.maximize();
  win.show();

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  
}



app.whenReady().then(() => {
  session.defaultSession.setProxy({ proxyRules: 'http=openapi.naver.com' });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (import.meta.platform !== 'darwin') {
    app.quit();
  }
});