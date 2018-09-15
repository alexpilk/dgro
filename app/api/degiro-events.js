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

async function getProductsByIds(product_ids) {
    return new Promise((resolve) => {
        utils.createDegiro().then(async dg => {
            let response = await dg.getProductsByIds(product_ids);
            console.log(response);
            resolve(response);
        })
    })
}

async function getAskBidPrice(product_id) {
    return new Promise((resolve) => {
        utils.createDegiro().then(async dg => {
            let response = await dg.getAskBidPrice(product_id);
            console.log(response);
            resolve(response);
        })
    })
}


module.exports = {
    searchProduct,
    getAskBidPrice,
    getProductsByIds
};
