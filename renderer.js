

// export function getData() {
//     console.log('Ass');
//     document.getElementById('hh').innerHTML = 'ololo';
//     const degiro = DeGiro.create({username: 'johndoe', password: '1234'});
//     degiro.login().then(session => console.log(session));
// }
const degiro = require('./degiro-events');

document.querySelector('#mbtn').addEventListener('click', degiro.getData);
// const ipc = require('electron').ipcRenderer;
//
// const asyncMsgBtn = document.getElementById('mbtn');
//
// asyncMsgBtn.addEventListener('click', function () {
//   ipc.send('asynchronous-message', 'ping')
// });
//
// ipc.on('asynchronous-reply', function (event, arg) {
//   const message = `Asynchronous message reply: ${arg}`;
//   document.getElementById('hh').innerHTML = message
// });
