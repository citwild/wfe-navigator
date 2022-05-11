const { app, BrowserWindow, Menu, ipcMain } = require('electron')

const path = require('path');
const url = require('url');

let mainWindow;

const knex = require('knex')({
  client: 'better-sqlite3',
  connection: {
    filename: 'C:/Users/Irene/source/repos/wfe-nav/BeamCoffer/BeamCoffer_meta.db'
  }
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //load the index.html from a url
  mainWindow.loadURL('http://localhost:3000');



  mainWindow.webContents.on('did-finish-load', ()=>{

    ipcMain.on("toMain",  (event, args) => {
      console.log("main IPC RECEIVED");
      let result = knex.select().from("media_files")
        .groupBy('nominal_date', 'location', 'equipment', 'media_type')
        .orderBy('nominal_date', 'location', 'equipment');
      result.then( (res) => {
        mainWindow.webContents.send("fromMain", res); // Send result back to renderer process
      })
    })

    ipcMain.on("getFiles",  (event, data) => {
      console.log("subquery IPC RECEIVED");
      let result = knex.select().from("media_files")
        .where({
          nominal_date: data[0], 
          location: data[1], 
          equipment: data[2]
        })
        .orderBy('time_begin');
      result.then( (res) => {
        console.log({res});
        mainWindow.webContents.send("sendFiles", res); // Send result back to renderer process
      })
    })





  });


  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function(){
    app.quit();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
