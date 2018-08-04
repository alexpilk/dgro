let remote = require('electron').remote;
const degiro = require('./degiro-events');


document.querySelector('#login').addEventListener('click', function() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    degiro.logIn(username, password);
});

// document.querySelector('#product_search').addEventListener('click', function() {
//     let product_name = document.getElementById('product_name').value;
//     degiro.searchProduct(product_name);
// });
products = document.querySelector('#products')
for(let product_id of remote.getGlobal('products')){
    let product_label = document.createElement('p');
    product_label.innerText = product_id;
    products.appendChild(product_label)
}

document.querySelector('#alwaysOnTop').addEventListener( 'change', function() {
    require('electron').remote.getCurrentWindow().setAlwaysOnTop(this.checked);
});
