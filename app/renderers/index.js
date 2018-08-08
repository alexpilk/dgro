let remote = require('electron').remote;
const degiro = require('../api/degiro-events');
const ipcRenderer = require('electron').ipcRenderer;
let cron = require('cron');
let refresh_interval = 20;
let cronJob = cron.job('*/' + refresh_interval + ' * * * * *', function () {
    refreshProducts()
});
cronJob.start();


async function refreshProducts() {
    for (let product of remote.getGlobal('products')) {
        let product_container = document.getElementById(product.id);
        product_container.innerHTML = await createProductPriceView(product);
    }
}


async function displayProducts() {
    let products = document.querySelector('#products');
    for (let product of remote.getGlobal('products')) {
        let product_container = document.createElement('div');
        product_container.id = product.id;
        product_container.innerHTML = await createProductPriceView(product);
        products.appendChild(product_container);
        document.getElementById(product.vwdId).addEventListener('click', () => {
            ipcRenderer.send('selected_product', product)
        })
    }
}

async function createProductPriceView(product) {
    let price = await degiro.getAskBidPrice(product.vwdId);
    return '' +
        '<input name="product" type="radio" id="' + product.vwdId + '"><b>' + product.symbol + '</b><br>' +
        'Ask price <i>' + price.askPrice + '</i><br>' +
        'Last price: <i>' + price.lastPrice + '</i><br>' +
        'Bid price: <i>' + price.bidPrice + '</i><br>' +
        'Last refresh: <i>' + price.lastTime + '</i><br>';
}

displayProducts();

document.querySelector('#alwaysOnTop').addEventListener('change', function () {
    require('electron').remote.getCurrentWindow().setAlwaysOnTop(this.checked);
});
