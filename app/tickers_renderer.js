const degiro = require('./degiro-events');


document.querySelector('#product_search').addEventListener('click', function() {
    let product_name = document.getElementById('product_name').value;
    degiro.searchProduct(product_name);
});
