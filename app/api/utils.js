let remote = require('electron').remote;
const DeGiro = require('degiro');


async function createDegiro() {
    try {
        let degiro = DeGiro.create({
            sessionId: remote.getGlobal('sessionId'),
            account: remote.getGlobal('sessionAccount')
        });
        degiro.session.userToken = remote.getGlobal('userToken');
        await degiro.updateConfig();
        console.log(degiro.session.id, degiro.session.account);
        return degiro;
    } catch (e) {
        console.error(e);
    }
}


module.exports = {
    createDegiro
};
