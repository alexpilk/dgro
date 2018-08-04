const utils = require('./utils');


utils.createDegiro().then(resolve => {
        degiro = resolve;
    }
);


async function searchProduct(product_name) {
    console.log('Searching for ' + product_name);
    let response = await degiro.searchProduct({text: product_name});
    let products = response.products;
    products.filter((product) => product.tradable);
    console.log(products);
    return products
}


async function getAskBidPrice(product_id) {
    let response = await degiro.getAskBidPrice(product_id);
    console.log(response);
    return response;
}


module.exports = {
    searchProduct
};
