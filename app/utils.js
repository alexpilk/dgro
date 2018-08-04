let remote = require('electron').remote;
const DeGiro = require('degiro');


async function createDegiro() {
    let degiro = DeGiro.create();
    try {
        degiro.session.id = remote.getGlobal('sessionId');
        degiro.session.account = remote.getGlobal('sessionAccount');
        await degiro.updateConfig();
    } catch (e) {
        console.error(e);
    }
    return degiro;
}


module.exports = {
    createDegiro
};
