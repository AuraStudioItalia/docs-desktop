const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  ready: () => ipcRenderer.send('window:ready'),
  onMaximizeState: (callback) => {
    ipcRenderer.on('window:maximize-state', (_event, isMaximized) => callback(isMaximized));
  },
  onDocumentTitle: (callback) => {
    ipcRenderer.on('window:document-title', (_event, title) => callback(title));
  }
});
