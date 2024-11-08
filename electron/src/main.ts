import { app, BrowserWindow, MenuItem, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import { AppSettings } from "./interfaces";
import { Menu } from 'electron';


const gotTheLock = app.requestSingleInstanceLock();

// Allow self signed certificates
app.commandLine.appendSwitch('ignore-certificate-errors');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const settingsFilename: string = app.getPath("userData") + "/settings.json";

var appSettings: AppSettings = new AppSettings();

// Load settings file if exists
if (fs.existsSync(settingsFilename)) {
  appSettings = JSON.parse(fs.readFileSync(settingsFilename).toString());
}

// Change locale if needed
if (appSettings.customLocale?.length > 0) {
  app.commandLine.appendSwitch('lang', appSettings.customLocale);
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "../dist/preload.js"),
      allowRunningInsecureContent: true,
      webSecurity: false,
    },
    fullscreen: true,
    autoHideMenuBar: true
  });

  let menu = Menu.getApplicationMenu();

  menu.append(new MenuItem({
    label: 'Start page',
    //accelerator: 'CommandOrControl+Shift+I',
    click: () => { if (isValidUrl(appSettings.startUrl)) mainWindow.loadURL(appSettings.startUrl) }
  }));


  menu.append(new MenuItem({
    label: 'Settings',
    //accelerator: 'CommandOrControl+Shift+I',
    click: (menuitem, window) => openSettings(mainWindow, window)
  }));

  mainWindow.setMenu(menu);

  // Load settings page if startUrl is empty
  if (appSettings.startUrl.trim() == "" || !isValidUrl(appSettings.startUrl)) {
    openSettings(mainWindow, mainWindow);
    mainWindow.loadURL("about:blank");
  } else {
    mainWindow.loadURL(appSettings.startUrl);
  }
  ipcMain.handle('settings-get', function (event, data) {
    return appSettings;
  });
  ipcMain.on('settings-change', function (event, data) {
    // Access form data here
    appSettings = data;
    writeSettings();
    autoLoginDone = false;
  });

  var autoLoginDone: boolean = false;
  ipcMain.handle('autologin-done', function (event, data) {
    autoLoginDone ||= data;
    return autoLoginDone;
  });


  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  return mainWindow;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function openSettings(mainWindow: BrowserWindow, currentWindow: BrowserWindow) {

  if (currentWindow != mainWindow) {
    return;
  }

  const settingsWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    },
    fullscreen: false,
    autoHideMenuBar: false,
    modal: true,
    parent: mainWindow
  });
  settingsWindow.loadFile(path.join(__dirname, '../dist/ui/index.html'));
}

function writeSettings() {
  fs.writeFile(settingsFilename, JSON.stringify(appSettings), () => console.log("New settings written to %s!", settingsFilename));
}

let myWindow: BrowserWindow = null;
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event: Event, argv: string[], workingDirectory: string) => {
    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) myWindow.restore();
      myWindow.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", () => {
    myWindow = createWindow();

    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) myWindow = createWindow();
    });
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
