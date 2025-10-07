// services/log-stream.js
const { EventEmitter } = require('events');

const logEmitter = new EventEmitter();

function log(message) {
    console.log(message);
    logEmitter.emit('log', message);
}

module.exports = { log, logEmitter };