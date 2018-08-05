const {globalShortcut} = require('electron');

const events = require('./api/degiro-events');


globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed');
    events.logIn();
});
