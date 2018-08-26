const ipcRenderer = require('electron').ipcRenderer;


document.getElementById('stop_limit_50_button').addEventListener('click', function () {
    let data = {
        shortcut: document.getElementById('stop_limit_50').value,
        action: 'stop_limit_sell_half'
    };
    ipcRenderer.send('shortcut', data)
});


// const {globalShortcut} = require('electron');
//
// const events = require('./api/degiro-events');
//
//
// globalShortcut.register('Control+G', () => {
//     console.log('CommandOrControl+X is pressed');
// });
