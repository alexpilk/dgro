const {globalShortcut} = require('electron');

const events = require('./degiro-events');


globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed');
    events.logIn();
});
