const loader = require('./loader');
const DeGiro = require('degiro');
const {app, ipcMain, BrowserWindow, globalShortcut} = require('electron');
// const api = require('./api/degiro-events');


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


function stop_limit_buy(product, size) {
    console.log('Buying stop-limit for ' + size + ' items');
    degiro.getAskBidPrice(product.vwdId).then((response) => {
        console.log(response.lastPrice);
        degiro.setOrder({
            buySell: DeGiro.Actions.buy,
            orderType: DeGiro.OrderTypes.stopLimited,
            productId: product.id,
            price: (response.lastPrice + 0.05).toFixed(2),
            stopPrice: (response.lastPrice + 0.01).toFixed(2),
            size: size
        })
    })
}

function stop_limit_sell(product, size) {
    console.log('Selling stop-limit for ' + size + ' items');
    degiro.getAskBidPrice(product.vwdId).then((response) => {
        console.log(response.lastPrice);
        degiro.setOrder({
            buySell: DeGiro.Actions.sell,
            orderType: DeGiro.OrderTypes.stopLimited,
            productId: product.id,
            price: (response.lastPrice - 0.05).toFixed(2),
            stopPrice: (response.lastPrice - 0.01).toFixed(2),
            size: size
        })
    })
}

function stop_limit_sell_part(product, percentage) {
    console.log('Selling stop-limit for ' + percentage * 100 + '% items');
    degiro.getPortfolio().then((response) => {
        let portfolio_product = response.portfolio.find(product => product.id === selected_product.id);
        let total_size = portfolio_product.value.find(attribute => attribute.name === 'size').value;
        let size = total_size * percentage;
        console.log('Selling ' + size + ' items out of ' + total_size);
        // console.log(portfolio_product);
        degiro.getAskBidPrice(product.vwdId).then((response) => {
            degiro.setOrder({
                buySell: DeGiro.Actions.sell,
                orderType: DeGiro.OrderTypes.stopLimited,
                productId: product.id,
                price: response.lastPrice - 0.05,
                stopPrice: response.lastPrice - 0.01,
                size: size
            })
        })
    });
}

function stop_limit_buy_part(product, percentage) {
    console.log('Buying stop-limit for ' + percentage * 100 + '% items');
    degiro.getPortfolio().then((response) => {
        let portfolio_product = response.portfolio.find(product => product.id === selected_product.id);
        let total_size = portfolio_product.value.find(attribute => attribute.name === 'size').value;
        let size = total_size * percentage;
        console.log('Buying ' + size + ' items out of ' + total_size);
        // console.log(portfolio_product);
        degiro.getAskBidPrice(product.vwdId).then((response) => {
            degiro.setOrder({
                buySell: DeGiro.Actions.buy,
                orderType: DeGiro.OrderTypes.stopLimited,
                productId: product.id,
                price: (response.lastPrice + 0.05).toFixed(2),
                stopPrice: (response.lastPrice + 0.01).toFixed(2),
                size: size
            })
        })
    });
}

let shortcut_functions = {
    stop_limit_buy_50: () => {
        stop_limit_buy(global.selected_product, 1);
    },
    stop_limit_buy_100: () => {
        stop_limit_buy(global.selected_product, 2);
    },
    stop_limit_buy_200: () => {
        stop_limit_buy(global.selected_product, 3);
    },
    stop_limit_buy_half: () => {
        stop_limit_buy_part(global.selected_product, 0.5);
    },
    stop_limit_buy_all: () => {
        stop_limit_buy_part(global.selected_product, 1);
    },
    stop_limit_sell_50: () => {
        stop_limit_sell(global.selected_product, 1);
    },
    stop_limit_sell_100: () => {
        stop_limit_sell(global.selected_product, 2);
    },
    stop_limit_sell_200: () => {
        stop_limit_sell(global.selected_product, 3);
    },
    stop_limit_sell_half: () => {
        stop_limit_sell_part(global.selected_product, 0.5);
    },
    stop_limit_sell_all: () => {
        stop_limit_sell_part(global.selected_product, 1);
    },
};


function registerShortcuts(shortcuts) {

    for (const action of Object.keys(shortcuts)) {
        const shortcut = shortcuts[action];
        console.log(action);
        console.log(shortcut);
        globalShortcut.register(shortcut, shortcut_functions[action]);
    }
    // for (let shortcut of shortcuts) {
    //     globalShortcut.register(shortcut.shortcut, shortcut_functions[shortcut.action]);
    // }
}


async function createWindow() {
    degiro = DeGiro.create();
    const session = await degiro.login();
    //
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
