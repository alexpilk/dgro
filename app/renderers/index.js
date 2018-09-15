let remote = require('electron').remote;
const degiro = require('../api/degiro-events');
const ipcRenderer = require('electron').ipcRenderer;
let cron = require('cron');
let refresh_interval = 5;

function startRefreshCronJob() {
    let cronJob = cron.job('*/' + refresh_interval + ' * * * * *', function () {
        refreshProducts()
    });
    cronJob.start();
}

async function refreshProducts() {
    try {
        let products = remote.getGlobal('products');
        for (let product of products) {
            let product_description = document.getElementById('description_' + product.vwdId);
            product_description.innerHTML = await createProductDescription(product);
        }
    } catch (e) {
        console.log('Cannot refresh products: ' + e)
    }
}


async function displayProducts() {
    try {
        let products = document.querySelector('#products');
        for (let product of remote.getGlobal('products')) {
            let product_container = document.createElement('div');
            product_container.id = product.id;
            product_container.innerHTML = await createProductPriceView(product);
            products.appendChild(product_container);
            let productListItem = document.getElementById(product.vwdId);
            productListItem.addEventListener('click', () => {
                ipcRenderer.send('selected_product', product)
            });
            document.getElementById('delete_' + product.vwdId).addEventListener('click', () => {
                product_container.outerHTML = "";
                ipcRenderer.send('delete_product', product)
            })
        }
        startRefreshCronJob()
    } catch (e) {
        console.log('Cannot display products');
        setTimeout(displayProducts, refresh_interval * 1000);
    }
}

async function createProductPriceView(product) {
    let selected_product = remote.getGlobal('selected_product');
    let checked = selected_product && selected_product.id === product.id ? 'checked' : '';
    return '' +
        '<input name="product" type="radio" id="' + product.vwdId + '"' + checked + '>' +
        '<button id="delete_' + product.vwdId + '">Delete</button>' + await createProductDescription(product);
}


async function createProductDescription(product) {
    let price = await degiro.getAskBidPrice(product.vwdId);
    return `
        <div id="description_${product.vwdId}">
        <b>${product.symbol}</b><br>
        Ask price <i>${price.askPrice} ${product.currency}</i> | 
        Last price: <i>${price.lastPrice} ${product.currency}</i> | 
        Bid price: <i>${price.bidPrice} ${product.currency}</i> | 
        Last refresh: <i>${price.lastTime}</i>
        </div>`
}

displayProducts();

document.querySelector('#alwaysOnTop').addEventListener('change', function () {
    require('electron').remote.getCurrentWindow().setAlwaysOnTop(this.checked);
});

document.querySelector('#login').addEventListener('click', function () {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    ipcRenderer.send('degiro_login', username, password)
});
