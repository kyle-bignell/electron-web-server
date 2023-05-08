const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('commands', {
    selectRoot: () => ipcRenderer.invoke('selectRoot'),
    portTaken: (port: number) => ipcRenderer.invoke('portTaken', port),
    findFreePort: (startPort: number, endPort: number) => ipcRenderer.invoke('findFreePort', startPort, endPort),
    startServer: (path: string, port: number) => ipcRenderer.invoke('startServer', path, port),
    stopServer: () => ipcRenderer.invoke('stopServer'),
});