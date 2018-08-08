const fs = require('fs');


async function loadProducts(degiro) {
    let data = fs.readFileSync('app/products.txt', 'utf8');
    let product_ids = data.split("\r\n");
    product_ids.pop();
    let response = await degiro.getProductsByIds(product_ids);
    let products = [];
    for (let product_id of product_ids) {
        products.push(response['data'][product_id])
    }
    return products
}


function saveProducts(products) {
    let data = '';
    for (let product of products) {
        data += product.id + '\r\n'
    }
    fs.writeFile('app/products.txt', data);
    console.log(data)
}


async function loadShortcuts() {
    let data = fs.readFileSync('app/shortcuts.txt', 'utf8');
    let settings = data.split("\r\n");
    settings.pop();
    let shortcuts = {};
    for (let setting of settings) {
        setting = setting.split(':');
        shortcuts[setting[1]] = setting[0]
    }
    console.log(shortcuts)
    return shortcuts
}


function saveShortcuts(shortcuts) {
    let data = '';
    for (const action of Object.keys(shortcuts)) {
        const shortcut = shortcuts[action];
        data += shortcut + ':' + action + '\r\n'
    }
    // for (let shortcut of shortcuts) {
    //     data += shortcut.shortcut + ':' + shortcut.action + '\r\n'
    // }
    fs.writeFile('app/shortcuts.txt', data);
    console.log(data)
}


module.exports = {
    loadProducts,
    saveProducts,
    loadShortcuts,
    saveShortcuts
};
