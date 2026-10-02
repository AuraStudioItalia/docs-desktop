const { app, BrowserWindow, Menu, shell, ipcMain, WebContentsView } = require('electron');
const path = require('node:path');

const DOCS_URL = 'https://docs.aurastudioitalia.it';
const DOCS_HOST = new URL(DOCS_URL).hostname;
const TITLE_BAR_HEIGHT = 40;

function isDocsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === DOCS_HOST;
  } catch {
    return false;
  }
}

function openExternal(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      shell.openExternal(url.href);
    }
  } catch {
    // Ignore malformed URLs from the remote page.
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 760,
    minHeight: 560,
    title: 'Aura Docs',
    icon: path.join(__dirname, 'imgs', 'docs.png'),
    frame: false,
    backgroundColor: '#f7f8fa',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const docsView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  window.contentView.addChildView(docsView);

  const updateDocsBounds = () => {
    const [width, height] = window.getContentSize();
    docsView.setBounds({
      x: 0,
      y: TITLE_BAR_HEIGHT,
      width,
      height: Math.max(0, height - TITLE_BAR_HEIGHT)
    });
  };
  const sendMaximizeState = () => {
    window.webContents.send('window:maximize-state', window.isMaximized());
  };

  updateDocsBounds();
  window.on('resize', updateDocsBounds);
  window.on('maximize', sendMaximizeState);
  window.on('unmaximize', sendMaximizeState);
  window.webContents.on('did-finish-load', sendMaximizeState);
  docsView.webContents.on('page-title-updated', (_event, title) => {
    window.setTitle(title || 'Aura Docs');
    window.webContents.send('window:document-title', title || 'Aura Docs');
  });

  window.once('ready-to-show', () => window.show());
  docsView.webContents.setWindowOpenHandler(({ url }) => {
    if (isDocsUrl(url)) {
      docsView.webContents.loadURL(url);
    } else {
      openExternal(url);
    }
    return { action: 'deny' };
  });
  docsView.webContents.on('will-navigate', (event, url) => {
    if (!isDocsUrl(url)) {
      event.preventDefault();
      openExternal(url);
    }
  });

  window.loadFile(path.join(__dirname, 'window.html'));
  docsView.webContents.loadURL(DOCS_URL);
}

ipcMain.on('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on('window:toggle-maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;
  if (window.isMaximized()) window.unmaximize();
  else window.maximize();
});

ipcMain.on('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.on('window:ready', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;
  event.sender.send('window:maximize-state', window.isMaximized());
  event.sender.send('window:document-title', window.getTitle());
});

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'close' }]
    },
    {
      label: 'Modifica',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Visualizza',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Finestra',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  app.setName('Aura Docs');
  if (process.platform === 'linux') app.setDesktopName('aura-docs-desktop.desktop');
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});