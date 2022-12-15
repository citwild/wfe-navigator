/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import e from 'express';

let mainWindow: BrowserWindow | null = null;
let dbFile: string;
let mediaDir: string;
let queryFields: any = null;
let knex: any;


ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    minWidth: 1280,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // from wfe-nav
  mainWindow.webContents.on('did-finish-load', () => {
    ipcMain.on('toMain', (event, args) => {
      console.log('main IPC RECEIVED');
      const result = knex
        .select()
        .from('media_files')
        .groupBy('nominal_date', 'location', 'equipment', 'media_type')
        .orderBy('nominal_date', 'location', 'equipment');
      result.then((res) => {
        mainWindow.webContents.send('fromMain', res); // Send result back to renderer process
      });
    });

    ipcMain.on('getFiles', (event, data) => {
      console.log('subquery IPC RECEIVED');
      const result = knex
        .select()
        .from('media_files')
        .where({
          nominal_date: data[0],
          location: data[1],
          equipment: data[2],
        })
        .orderBy('time_begin');
      result.then((res) => {
        console.log({ res });
        mainWindow.webContents.send('sendFiles', res); // Send result back to renderer process
      });
    });

    ipcMain.on('reqFileInDir', (event, data) => {
      console.log(data);
      shell.showItem(data);
      shell.showItemInFolder(data);
    });

    ipcMain.on('findMediaInStream', (event, sm_stream_id) => {
      console.log('retrieve media in stream');
      const result = knex
        .select()
        .from('media_files')
        .join('stream_media', {
          'media_files.media_id': 'stream_media.media_id',
        })
        .where('stream_media.stream_id', sm_stream_id);
      result.then((res) => {
        mainWindow.webContents.send('allMediaInStream', res); // Send result back to renderer process
      });
    });

    ipcMain.removeHandler('getStreamContents'); // prevent redundant handler registration on reload
    ipcMain.handle('getStreamContents', async (event, sm_stream_id) => {
      console.log(`retrieve media in stream #${sm_stream_id}`);
      const result = await knex
        .select()
        .from('media_files')
        .join('stream_media', {
          'media_files.media_id': 'stream_media.media_id',
        })
        .where('stream_media.stream_id', sm_stream_id);
      return result;
    });

    // sync
    ipcMain.on('getQueryFields', (event, args) => {
      console.log(`retrieving fields for query builder...`);
      event.returnValue = queryFields;
    });


    ipcMain.on('queryStreams', (event, whereQuery) => {
      console.log('find all streams with media that applies to subquery');

      const result = knex
        .select('stream_id')
        .distinct()
        .from('stream_media')
        .join('media_files', {
          'media_files.media_id': 'stream_media.media_id',
        })
        .whereRaw(whereQuery);

      result.then((res) => {
        console.warn(res);
        mainWindow.webContents.send('foundStreams', res); // Send result back to renderer process
      });
    });

    ipcMain.on('getMediaDir', (event) => {
      console.log('retrieve mediaDir');
      if (mediaDir !== undefined) {
        mainWindow.webContents.send('mediaDir', mediaDir); // Send result back to renderer process
      } else {
        mainWindow.webContents.send('mediaDir', '');
      }
    });

    mainWindow?.webContents.openDevTools();
  });

  mainWindow.on('show', () => {
    if (knex === undefined || mediaDir === '') {
      const { dialog } = require('electron');
      const options = {
        title: 'Select your WFE-Navigator configuration file',
        buttonLabel: 'Use this Configuration',
        filters: [
          {
            name: 'WFE-Navigator Configuration Files',
            extensions: ['config.wfen'],
          },
        ],
        properties: ['openFile'],
      };

      // show dialog asking user to select config to load wfe-nav
      const filePaths = dialog.showOpenDialogSync(mainWindow, options);
      if (filePaths === undefined) {
        console.log('no config file selected');
      } else {
        console.log(filePaths[0]);
        const filePath = filePaths[0];

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.log(err);
          } else {
            const dataParsed = JSON.parse(data);
            // set media dir path
            const lastCharInMediaDir = dataParsed.media.directoryPath.charAt(
              dataParsed.media.directoryPath.length - 1
            );
            dbFile = dataParsed.database.filePath;
            mediaDir =
              lastCharInMediaDir !== '/'
                ? `${dataParsed.media.directoryPath}/`
                : dataParsed.media.directoryPath;
            console.log(mediaDir);
            queryFields = dataParsed.querybuilder.fields;
            console.log(queryFields);
            // set up database connection
            knex = require('knex')({
              client: dataParsed.database.client,
              connection: {
                filename: dataParsed.database.filePath,
              },
            });
          }
        });
      }
    }
  });

};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.log);
