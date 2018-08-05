const ipcRenderer = require('electron').ipcRenderer;
const degiro = require('../api/degiro-events');


document.querySelector('#product_search').addEventListener('click', function () {
    let product_name = document.getElementById('product_name').value;

    degiro.searchProduct(product_name).then((products) => {
        let search_results = document.getElementById('search_results');
        let menu = createProductSelectionMenu(products);
        search_results.appendChild(menu);
        const select_button = document.createElement('button');
        select_button.id = 'product_select';
        select_button.innerText = 'Add';
        select_button.addEventListener('click', function () {
            for (let product of products) {
                let button = document.getElementById(product.id);
                if (button.checked) {
                    ipcRenderer.send('product_id', product);
                    return
                }
            }
        });
        search_results.appendChild(select_button)
    });
});


function createProductSelectionMenu(products) {
    const list = document.createElement('ul');
    for (let product of products) {
        console.log(product);
        const list_element = document.createElement('li');
        const ticker_button = document.createElement('input');
        const label = document.createElement('label');
        ticker_button.type = 'radio';
        ticker_button.id = product.id;
        ticker_button.name = 'product';
        ticker_button.value = product.symbol;
        label.innerText = product.symbol;
        list_element.appendChild(ticker_button);
        list_element.appendChild(label);
        list.appendChild(list_element);
    }
    return list;
}
