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
    for (let product of products){
        data += product.id + '\r\n'
    }
    fs.writeFile('app/products.txt', data);
    console.log(data)
}


module.exports = {
    loadProducts,
    saveProducts
};
