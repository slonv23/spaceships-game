// initialize required modules
import './engine/net/format';
import './engine/state';

import Engine from './engine';
import FlyingObject from './engine/physics/object/FlyingObject';
import {controllers} from "./engine/object-control";
// setup EventTarget and CustomEvent polyfills
import {EventTarget} from "event-target-shim";
global.EventTarget = EventTarget;


import {gameObjectTypes} from "./constants";

const logger = require('./utils/logger');
const SocketServer = require('./service/SocketServer');
const Simulation = require('./service/Simulation');
const StateDispatcher = require('./service/StateDispatcher');

const SOCKET_FILE = '/tmp/spaceships-world-simulator.sock';
const diContainer = Engine.getDiContainer();

configureEngine();

(async () => {
    const messageSerializerDeserializer = await diContainer.get('messageSerializerDeserializer');
    const stateManager = await diContainer.get('authoritativeStateManager');
    stateManager.registerGameObjectType(gameObjectTypes.SPACESHIP, FlyingObject, controllers.REMOTE_FLYING_OBJECT_CONTROLLER);

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

function configureEngine() {
    diContainer.provide('logger', logger);
    diContainer.configure('messageSerializerDeserializer',  {protoBundle: require('../../common/proto/bundle.json')});
}
