// setup EventTarget and CustomEvent polyfills
import {EventTarget} from "event-target-shim";
global.EventTarget = EventTarget;

// initialize required modules
import './engine/net/format';
import './engine/state';
import './engine/asset-management';

import Engine from './engine';
import {config as engineConfig} from './engine/globals';
import {controllers} from "./engine/object-control";

import {gameObjectTypes} from "./constants";
import {spaceFighterFactory} from "./game-objects";

const logger = require('./utils/logger');
const SocketServer = require('./service/SocketServer');
const Simulation = require('./service/Simulation');
const StateDispatcher = require('./service/StateDispatcher');
const config = require('./config');

const SOCKET_FILE = '/tmp/spaceships-world-simulator.sock';
const diContainer = Engine.getDiContainer();

configureEngine();

(async () => {
    const assetManager = await diContainer.get('assetManager');
    const asset3d = assetManager.get3dAsset('smallSpaceFighter');
    debugger;

    const messageSerializerDeserializer = await diContainer.get('messageSerializerDeserializer');
    const stateManager = await diContainer.get('authoritativeStateManager');
    stateManager.registerGameObjectType(gameObjectTypes.SPACESHIP, spaceFighterFactory, controllers.REMOTE_SPACE_FIGHTER_CONTROLLER);

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
    engineConfig.env = 'node';
    engineConfig.rootDir = require('path').resolve(__dirname, '../dist');
    diContainer.provide('logger', logger);
    diContainer.configure('messageSerializerDeserializer',  {protoBundle: require('../../common/proto/bundle.json')});
    diContainer.configure('assetManager', {filepaths: config.assets});
}
