let remote = require('electron').remote;
const DeGiro = require('degiro');
// let degiro = DeGiro.create({
//     sessionId: remote.getGlobal('sessionId'),
//     sessionAccount: remote.getGlobal('sessionAccount')
// });
// degiro.session = remote.getGlobal('session');
// console.log(degiro);
// console.log(remote.getGlobal('sessionAccount'));
// console.log(remote.getGlobal('sessionId'));

const degiro = DeGiro.create({
    sessionId: remote.getGlobal('sessionId'),
    sessionAccount: remote.getGlobal('sessionAccount')
});

(async () => {
    try {
        degiro.session.id = remote.getGlobal('sessionId');
        degiro.session.account = remote.getGlobal('sessionAccount');
        await degiro.updateConfig(); // needed to update internal configuration
        degiro.session = remote.getGlobal('session');
        console.log(await degiro.getPortfolio());
    } catch (e) {
        console.error(e);
    }
})();

function logIn(username, password) {
    // console.log(degiro);
    // console.log('Logging in...');
    // degiro = DeGiro.create({username: username, password: password});
    // remote.setGlob( window.localStorage.setItem('degiro', JSON.stringify(degiro));
    degiro.login().then(session => console.log(session));
}

async function searchProduct(product_name) {
    // const degiro = remote.getGlobal('DEGIRO');
    // console.log(degiro);
    console.log('Searching for ' + product_name);
    // console.degiro = degiro
    // degiro = console.degiro
    // let session = await degiro.login();
    await degiro.updateConfig();
    // console.log(session);
    console.log(await degiro.searchProduct({text: 'AAPL'}));

    // await degiro.login().then(session => console.log(session)).then(degiro.searchProduct({text: product_name})).then(
    //     console.log
    // );
    // degiro.login().then(session => console.log(session));

    // degiro = DeGiro.create({sessionId: '648697506F09B0122DE978C50C9ED94C.staging1', account: 166372});
    // degiro
    // .login()
    // .then(degiro.getPortfolio)
    // .then(res => console.log(JSON.stringify(res, null, '  ')))
    // .catch(console.error);

    // degiro.login().then(degiro.getPortfolio)
    // .then(res => console.log(JSON.stringify(res, null, '  ')))
    // .catch(console.error);
    // degiro.getPortfolio()
    // .then(res => console.log(JSON.stringify(res, null, '  ')))
    // .catch(console.error);
    // degiro.login().then(session => console.log(session));
    // degiro.getPortfolio().then(console.log)
    // let products = degiro.searchProduct({text: product_name});
    // console.log(products);
    // console.log(products.length)
}

module.exports = {
    logIn,
    searchProduct
};
