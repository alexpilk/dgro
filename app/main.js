const loader = require('./loader');
const DeGiro = require('degiro');
const {app, ipcMain, BrowserWindow} = require('electron');
// require('./event_handlers');


let win;

ipcMain.on('product_id', function (event, product) {
    global.products.push(product);
    console.log('Received ' + product)
});


async function createWindow() {
    const degiro = DeGiro.create();
    const session = await degiro.login();

    global.session = session;
    global.sessionId = session.id;
    global.sessionAccount = session.account;
    global.products = await loader.loadProducts(degiro);

    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('app/templates/index.html');

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

app.on('ready', () => {
    createWindow();
    // require('./shortcut-listeners');
    // enableShortcutListeners();
});

app.on('window-all-closed', () => {
    loader.saveProducts(global.products);
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});
