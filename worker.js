const worker_threads = require('worker_threads')
const crypto = require('crypto')

const client_id = worker_threads.workerData
const clientHash = crypto
    .createHmac('sha256', client_id)
    .update('I love cupcakes')
    .digest('hex');
console.log('clientHash', clientHash)

worker_threads.parentPort.postMessage(clientHash)
