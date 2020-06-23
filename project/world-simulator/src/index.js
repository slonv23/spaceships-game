// initialize required modules
import './engine/net/format';
import './engine/state';

import Engine from './engine';
import FlyingObject from './engine/physics/object/FlyingObject';

const logger = require('./utils/logger');
const SocketServer = require('./service/SocketServer');
const Simulation = require('./service/Simulation');
const StateDispatcher = require('./service/StateDispatcher');

const SOCKET_FILE = '/tmp/spaceships-world-simulator.sock';

(async () => {
    const diContainer = Engine.getDiContainer();
    diContainer.configure('messageSerializerDeserializer',  {protoBundle: require('../../common/proto/bundle.json')});
    const messageSerializerDeserializer = await diContainer.get('messageSerializerDeserializer');
    const stateManager = await diContainer.get('stateManager');

    const socketServer = new SocketServer(SOCKET_FILE, messageSerializerDeserializer, stateManager);
    const stateDispatcher = new StateDispatcher(stateManager, socketServer, messageSerializerDeserializer)
    const simulation = new Simulation(stateManager);
    simulation.onIterCompleted(stateDispatcher.handleStateUpdated);

    socketServer.start();
    simulation.startGameLoop();

    function shutdown() {
        if (!shutdown.shuttingDown && socketServer) {
            shutdown.shuttingDown = true;
            logger.info('Terminating');

            socketServer.cleanup();

            process.exit(0);
        }
    }

    process.on('SIGINT', shutdown);
})();

function createBot() {
    let gameObject = new FlyingObject(/* something */);
    gameObject.object3d.matrixAutoUpdate = false;
    this.renderer.scene.add(gameObject.object3d);
    this.stateManager.addObject(gameObject);
}
