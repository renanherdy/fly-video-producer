const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const { autoSlice } = require('./api/workers/videoSlicer');

let mainWindow
app.on('ready', () => {
  console.log('app ready');
  const htmlPath = path.join('src', 'index.html')
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile(htmlPath)
});

const util = require('util')
const fs = require('fs')
const stat = util.promisify(fs.stat)

ipcMain.on('files',
  async (event, filesArr) => {
    try {
      console.log(autoSlice);
      const data = await autoSlice(filesArr)
      console.log('data');
      console.log(data);
      // const data = 'ok';
      // const data = await Promise.all(
      //   filesArr.map(async ({ name, pathName }) => ({
      //     ...await stat(pathName),
      //     name,
      //     pathName
      //   }))
      // )
      mainWindow.webContents.send('metadata', autoSlice)
    } catch (error) {
      mainWindow.webContents.send('metadata:error', error)
    }
  })