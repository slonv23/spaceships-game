// initialize required modules
import './engine/net/format';
import './engine/state';

import {diContainer} from './engine';

const logger = require('./utils/logger');
const SocketServer = require('./service/SocketServer');
const Simulation = require('./service/Simulation');
const StateDispatcher = require('./service/StateDispatcher');

const SOCKET_FILE = '/tmp/spaceships-world-simulator.sock';

(async () => {
    diContainer.configure('messageEncoderDecoder',  {protoBundle: require('../../common/proto/bundle.json')});
    const messageEncoderDecoder = await diContainer.get('messageEncoderDecoder');
    const stateManager = await diContainer.get('stateManager');

    const sockerServer = new SocketServer(SOCKET_FILE, messageEncoderDecoder);
    const stateDispatcher = new StateDispatcher(stateManager, sockerServer, messageEncoderDecoder)
    const simulation = new Simulation(stateManager);
    simulation.onIterCompleted(stateDispatcher.handleStateUpdated);

    sockerServer.start();
    simulation.startGameLoop();

    function shutdown() {
        if (!shutdown.shuttingDown && sockerServer) {
            shutdown.shuttingDown = true;
            logger.info('Terminating');
    
            sockerServer.cleanup();
    
            process.exit(0);
        }
    }
    
    process.on('SIGINT', shutdown);
})();
