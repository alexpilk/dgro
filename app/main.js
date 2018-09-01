const loader = require('./loader');
const DeGiro = require('degiro');
const {app, ipcMain, BrowserWindow, globalShortcut} = require('electron');
const prompt = require('electron-prompt');

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


function update_log(product, action, size, price, stop_price) {
    degiro.getAskBidPrice(product.vwdId).then((response) => {
        let difference = (price - response.lastPrice).toFixed(2);
        // let message = action + ' ' + size + ' items of ' + product.name +
        //     '. Price: ' + price + '. Stop price: ' + stop_price + '. Price - Last price = ' + difference;
        let message = `${action} ${size} items of ${product.name}. Price: ${price}. Stop price ${stop_price}. ` +
            `Price - Last price = ${difference}`;
        global.log.push(message);
        console.log(message);
        console.log(global.log)
    })
}

function stop_limit_buy(product, size) {
    console.log('Buying stop-limit for ' + size + ' items');
    degiro.getAskBidPrice(product.vwdId).then((response) => {
        let price = (response.lastPrice + 0.05).toFixed(2);
        let stop_price = (response.lastPrice + 0.01).toFixed(2);
        degiro.setOrder({
            buySell: DeGiro.Actions.buy,
            orderType: DeGiro.OrderTypes.stopLimited,
            productId: product.id,
            price: price,
            stopPrice: stop_price,
            size: size
        }).then((response) => {
            if (response.orderId) {
                update_log(product, 'buy', size, price, stop_price)
            }
        })
    })
}

function stop_limit_sell(product, size) {
    console.log('Selling stop-limit for ' + size + ' items');
    degiro.getAskBidPrice(product.vwdId).then((response) => {
        console.log(response.lastPrice);
        let price = (response.lastPrice - 0.05).toFixed(2);
        let stop_price = (response.lastPrice - 0.01).toFixed(2);
        degiro.setOrder({
            buySell: DeGiro.Actions.sell,
            orderType: DeGiro.OrderTypes.stopLimited,
            productId: product.id,
            price: price,
            stopPrice: stop_price,
            size: size
        }).then((response) => {
            if (response.orderId) {
                update_log(product, 'Sell', size, price, stop_price)
            }
        })
    })
}

function stop_limit_sell_part(product, percentage) {
    console.log('Selling stop-limit for ' + percentage * 100 + '% items');
    degiro.getPortfolio().then((response) => {
        let portfolio_product = response.portfolio.find(product => product.id === selected_product.id);
        let total_size = portfolio_product.value.find(attribute => attribute.name === 'size').value;
        let size = Math.round(total_size * percentage);
        console.log('Selling ' + size + ' items out of ' + total_size);
        stop_limit_sell(product, size)
    });
}

function stop_limit_buy_part(product, percentage) {
    console.log('Buying stop-limit for ' + percentage * 100 + '% items');
    degiro.getPortfolio().then((response) => {
        let portfolio_product = response.portfolio.find(product => product.id === selected_product.id);
        let total_size = portfolio_product.value.find(attribute => attribute.name === 'size').value;
        let size = Math.round(total_size * percentage);
        console.log('Buying ' + size + ' items out of ' + total_size);
        stop_limit_buy(product, size)
    });
}

function stop_loss(product, size, action) {
    prompt({
        title: 'Enter stop-loss price for size ' + size,
        inputAttrs: {
            type: 'int',
            required: true
        },
        type: 'input'
    }).then((price) => {
        if (price === null) {
            console.log('user cancelled');
        } else {
            degiro.setOrder({
                buySell: action,
                orderType: DeGiro.OrderTypes.stopLoss,
                productId: product.id,
                stopPrice: price,
                size: size
            })
        }
    }).catch(console.error);
}


function stop_loss_part(product, percentage, action) {
    console.log('Stop-loss for ' + percentage * 100 + '% items');
    degiro.getPortfolio().then((response) => {
        let portfolio_product = response.portfolio.find(product => product.id === selected_product.id);
        let total_size = portfolio_product.value.find(attribute => attribute.name === 'size').value;
        let size = Math.round(total_size * percentage);
        stop_loss(product, size, action)
    });
}

let shortcut_functions = {
    stop_limit_buy_50: () => {
        stop_limit_buy(global.selected_product, 50);
    },
    stop_limit_buy_100: () => {
        stop_limit_buy(global.selected_product, 100);
    },
    stop_limit_buy_200: () => {
        stop_limit_buy(global.selected_product, 200);
    },
    stop_limit_buy_half: () => {
        stop_limit_buy_part(global.selected_product, 0.5);
    },
    stop_limit_buy_all: () => {
        stop_limit_buy_part(global.selected_product, 1);
    },
    stop_limit_sell_50: () => {
        stop_limit_sell(global.selected_product, 50);
    },
    stop_limit_sell_100: () => {
        stop_limit_sell(global.selected_product, 100);
    },
    stop_limit_sell_200: () => {
        stop_limit_sell(global.selected_product, 200);
    },
    stop_limit_sell_half: () => {
        stop_limit_sell_part(global.selected_product, 0.5);
    },
    stop_limit_sell_all: () => {
        stop_limit_sell_part(global.selected_product, 1);
    },
    stop_loss_buy_half: () => {
        stop_loss_part(global.selected_product, 0.5, DeGiro.Actions.buy);
    },
    stop_loss_buy_all: () => {
        stop_loss_part(global.selected_product, 1, DeGiro.Actions.buy);
    },
    stop_loss_sell_half: () => {
        stop_loss_part(global.selected_product, 0.5, DeGiro.Actions.sell);
    },
    stop_loss_sell_all: () => {
        stop_loss_part(global.selected_product, 1, DeGiro.Actions.sell);
    },
};


function registerShortcuts(shortcuts) {
    for (const action of Object.keys(shortcuts)) {
        const shortcut = shortcuts[action];
        globalShortcut.register(shortcut, shortcut_functions[action]);
    }
}


async function prepare_degiro_session() {
    degiro = DeGiro.create();
    const session = await degiro.login();

    global.session = session;
    global.sessionId = session.id;
    global.sessionAccount = session.account;
}

async function prepare_configuration() {
    global.log = [];
    global.products = await loader.loadProducts(degiro);
    global.shortcuts = await loader.loadShortcuts();
    registerShortcuts(global.shortcuts);
}

async function createWindow() {
    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('app/templates/index.html');

    // Open the DevTools.
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null
    });
    win.setAlwaysOnTop(true, "floating");
}

app.on('ready', async () => {
    await prepare_degiro_session();
    await prepare_configuration();
    await createWindow();
});

app.on('window-all-closed', () => {
    loader.saveProducts(global.products);
    loader.saveShortcuts(global.shortcuts);
    loader.saveLogs(global.log);
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});
