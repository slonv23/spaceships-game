const logger = require('./utils/logger');
const SocketServer = require('./socket-server');

const SOCKET_FILE = '/tmp/spaceships-world-simulator.sock';

const sockerServer = new SocketServer(SOCKET_FILE);
sockerServer.start();

function shutdown() {
    if (!shutdown.shuttingDown && sockerServer) {
        shutdown.shuttingDown = true;
        logger.info('Terminating');

        sockerServer.cleanup();

        process.exit(0);
    }
}

process.on('SIGINT', shutdown);