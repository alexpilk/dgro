const loader = require('./loader');
const DeGiro = require('degiro');
const {app, ipcMain, BrowserWindow, globalShortcut} = require('electron');
const api = require('./api/degiro-events');


let win;
let degiro;


ipcMain.on('product_id', function (event, product) {
    global.products.push(product);
    console.log('Received ' + product)
});


ipcMain.on('shortcut', function (event, data) {
    globalShortcut.unregister(global.shortcuts[data.action]);
    global.shortcuts[data.action] = data.shortcut;
    globalShortcut.register(data.shortcut, shortcut_functions[data.action]);
});


ipcMain.on('selected_product', function (event, id) {
    global.selected_product = id;
    console.log(global.selected_product)
});


let shortcut_functions = {
    stop_limit_50: () => {
        console.log('Stop lim 50');
        let product = global.selected_product;
        degiro.getAskBidPrice(product.vwdId).then((response) => {
            console.log(response.lastPrice);
            // console.log({
            //     buySell: DeGiro.Actions.buy,
            //     orderType: DeGiro.OrderTypes.stopLimited,
            //     productId: product.id,
            //     price: response.lastPrice,
            //     stopPrice: response.lastPrice + 0.05
            // })
            degiro.setOrder({
                buySell: DeGiro.Actions.buy,
                orderType: DeGiro.OrderTypes.stopLimited,
                productId: product.id,
                price: response.lastPrice + 0.05,
                stopPrice: response.lastPrice + 0.01,
                size: 2
            })
        })
    },
    stop_limit_100: () => {
        console.log('Stop lim 100')
    },
};


function registerShortcuts(shortcuts) {

    for (const action of Object.keys(shortcuts)) {
        const shortcut = shortcuts[action];
        globalShortcut.register(shortcut, shortcut_functions[action]);
    }
    // for (let shortcut of shortcuts) {
    //     globalShortcut.register(shortcut.shortcut, shortcut_functions[shortcut.action]);
    // }
}


async function createWindow() {
    degiro = DeGiro.create();
    const session = await degiro.login();

    global.session = session;
    global.sessionId = session.id;
    global.sessionAccount = session.account;
    global.products = await loader.loadProducts(degiro);
    global.shortcuts = await loader.loadShortcuts();
    registerShortcuts(global.shortcuts);

    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('app/templates/index.html');

    // Open the DevTools.
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null
    });
    win.setAlwaysOnTop(true, "floating");
    // globalShortcut.register('Control+G', () => {
    //     console.log('CommandOrControl+X is pressed');
    // });
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
});

app.on('window-all-closed', () => {
    loader.saveProducts(global.products);
    console.log(global.shortcuts);
    loader.saveShortcuts(global.shortcuts);
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});
