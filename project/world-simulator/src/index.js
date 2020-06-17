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
    //const stateManager = await diContainer.get('stateManager');

    const sockerServer = new SocketServer(SOCKET_FILE, messageSerializerDeserializer);
    /*const stateDispatcher = new StateDispatcher(stateManager, sockerServer, messageEncoderDecoder)
    const simulation = new Simulation(stateManager);
    simulation.onIterCompleted(stateDispatcher.handleStateUpdated);*/

    sockerServer.start();
    //simulation.startGameLoop();

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

function createBot() {
    let gameObject = new FlyingObject(/* something */);
    gameObject.object3d.matrixAutoUpdate = false;
    this.renderer.scene.add(gameObject.object3d);
    this.stateManager.addObject(gameObject);
}
