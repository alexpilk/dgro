const DeGiro = require('degiro');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const {app, ipcMain, BrowserWindow} = require('electron');
let win;

ipcMain.on('product_id', function (event, product_id) {
    global.products.push(product_id);
    console.log('Received ' + product_id)
});

async function createWindow() {
    const degiro = DeGiro.create();
    const session = await degiro.login();

    global.session = session;
    global.sessionId = session.id;
    global.sessionAccount = session.account;

    global.products = [];

    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('app/index.html');

    // Open the DevTools.
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null
    });
    win.setAlwaysOnTop(true, "floating");

    //
    // var events = require('./degiro-events');
    // globalShortcut.register('CommandOrControl+X', () => {
    //   console.log('CommandOrControl+X is pressed');
    //     events.getData();
    // })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    // require('./shortcut-listeners');
    // enableShortcutListeners();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// require('./event_handlers');

