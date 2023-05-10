import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import express from 'express';
import open from 'open';
import * as path from 'path';
import * as http from "http";
import netstat from 'node-netstat';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let expressServer: http.Server = null;

const netstatP = (opts: netstat.Options): Promise<Array<netstat.ParsedItem>> =>
  new Promise((resolve, reject) => {
    const results: Array<netstat.ParsedItem> = [];

    netstat(
      {
        ...opts,
        done: (error) => {
          if (error) {
            reject(error);
          }
          resolve(results);
        }
      },
      (data) => {
        results.push(data);
        return;
      }
    );
  });

const selectRoot = async (mainWindow: BrowserWindow): Promise<string> => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })

  // TODO - Error handling when cancelling

  return result.filePaths[0];
};

const portTaken = async (port: number) => {
  const usedPorts = (await netstatP({ filter: { protocol: 'tcp' } })).map(
    ({ local }) => local.port
  );

  return usedPorts.includes(port);
};

const findFreePort = async (startPort: number, endPort: number) => {
  const usedPorts = (await netstatP({ filter: { protocol: 'tcp' } })).map(
    ({ local }) => local.port
  );

  let freePort = 0;
  for (let port = startPort; port <= endPort; port++) {
    if (!usedPorts.includes(port)) {
      freePort = port;
      break;
    }
  }

  return freePort;
};

const startServer = (rootPath: string, port: number): boolean => {
  try {
    const staticPath = path.resolve(rootPath);
    const url = `http://localhost:${port}`;

    const expressApp = express();
    expressApp.use(express.static(staticPath));
    expressServer = expressApp.listen(port);

    open(url);

    return true;
  } catch (error) {
    return false;
  }
};

const stopServer = async () => {
  return new Promise((resolve) => {
    if (expressServer) {
      expressServer.closeAllConnections();
      expressServer.close((error) => {
        if (error) {
          console.log(error);
        }

        resolve(false);
      });
    }

    resolve(false);
  });
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 650,
    width: 800,
    icon: 'icon.ico',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  ipcMain.handle('selectRoot', () => selectRoot(mainWindow));
  ipcMain.handle('portTaken', (event: Electron.IpcMainInvokeEvent, port: number) => portTaken(port));
  ipcMain.handle('findFreePort', (event: Electron.IpcMainInvokeEvent, startPort: number, endPort: number) => findFreePort(startPort, endPort));
  ipcMain.handle('startServer', (event: Electron.IpcMainInvokeEvent, rootPath: string, port: number) => startServer(rootPath, port));
  ipcMain.handle('stopServer', () => stopServer());

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.removeMenu();
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
