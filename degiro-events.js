const DeGiro = require('degiro');

function getData() {
    console.log('Ass');
    // document.getElementById('hh').innerHTML = 'ololo';
    const degiro = DeGiro.create({username: 'johndoe', password: '1234'});
    degiro.login().then(session => console.log(session));
}

module.exports = {
    getData
};
