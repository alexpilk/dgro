let remote = require('electron').remote;

let log = remote.getGlobal('log');
console.log(log);
let log_container = document.getElementById('log');

for(let message of log) {
    let element = document.createElement('p');
    element.appendChild(document.createTextNode(message));
    log_container.appendChild(element)
}
