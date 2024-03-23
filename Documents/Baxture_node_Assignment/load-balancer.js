const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const os = require('os');

const PORT = process.env.PORT || 4000;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const numCPUs = os.cpus().length;
    const workers = [];

    // Fork worker processes
    for (let i = 0; i < numCPUs - 1; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }

    // Round-robin scheduling
    let nextWorkerIndex = 0;

    function getNextWorker() {
        const worker = workers[nextWorkerIndex];
        nextWorkerIndex = (nextWorkerIndex + 1) % workers.length;
        return worker;
    }

    // Load balancer listening for requests
    const server = http.createServer((req, res) => {
        const worker = getNextWorker();
        worker.send({ type: 'request', data: { req, res } });
    });

    server.listen(PORT, () => {
        console.log(`Load balancer listening on port ${PORT}`);
    });

    // Handle messages from worker processes
    cluster.on('message', (worker, message) => {
        console.log(`Received message from worker ${worker.process.pid}: ${JSON.stringify(message)}`);
    });
} else {
    // Worker process
    require('./index.js'); // Assuming index.js contains your application logic

    // Listen for messages from the master process
    process.on('message', (message) => {
        if (message.type === 'request') {
            const { req, res } = message.data;
            // Handle the request in your application logic
            res.writeHead(200);
            res.end('hello world\n');
        }
    });
}
