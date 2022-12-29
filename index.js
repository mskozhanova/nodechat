const socket = require('socket.io')
const http = require('http')
const path = require('path')
const fs = require('fs')

const worker_threads = require('worker_threads')

const nickGenerator = (data) => {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads.Worker('./worker.js', {
            workerData: data
        })

        worker.on('message', resolve)
        worker.on('error', reject)
    })
}

const server = http.createServer(
    (req, res) => {
        //console.log(`Url запроса: ${req.url}`);
        let indexPath = path.join(__dirname, './index.html')
        if(req.url == '/style.css' )
        {
            indexPath = path.join(__dirname, './style.css')
        }
        //console.log(`indexPath: ${indexPath}`);
        const readStream = fs.createReadStream(indexPath)
        readStream.pipe(res)
    }
);

const io = socket(server);


io.on('connection', client => {
    console.log(`Client ${client.id} connected`)
    client.on('client-msg', data => {
        //console.log(data)

        const payload = {
            message: data.message, // data.message.split('').reverse().join(''),
            client_id: client.id,
            nick: data.nick,
        }

        client.broadcast.emit('server-msg', payload)
        client.emit('server-msg', payload)
    })
    client.on('client-connect', async () => {
        //generate nickname
        let nickname = await nickGenerator(client.id)

        const payload = {
            message: `${nickname} arrived!`,
            client_id: 'System',
            nick:  'System',
            system: true,
            css: 'arrived'
        }
        client.emit('server-nick', nickname)
        client.broadcast.emit('server-msg', payload)
        client.emit('server-msg', payload)
    })
    client.on('client-reconnect', data => {
        const payload = {
            message: `${data} reconnected!`,
            client_id: 'System',
            nick:  'System',
            system: true,
            css: 'returned'
        }
        client.broadcast.emit('server-msg', payload)
        client.emit('server-msg', payload)
    })
    client.on('client-disconnect', data => {
        const payload = {
            message: `${data} gone!`,
            client_id: 'System',
            nick:  'System',
            system: true,
            css: 'gone'
        }
        client.broadcast.emit('server-msg', payload)
        client.emit('server-msg', payload)
    })
});

io.on('connect', client => {
    console.log(`Client ${client.id} connect`)
    //console.log(client)
})

server.listen(5555)