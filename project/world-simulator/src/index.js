// initialize required modules
import './polyfills'
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

class GameServer {

    constructor() {
        this.diContainer = Engine.getDiContainer();
        this.configureEngine();
    }

    configureEngine() {
        engineConfig.env = 'node';
        engineConfig.rootDir = require('path').resolve(__dirname, '../dist');
        this.diContainer.provide('logger', logger);
        this.diContainer.configure('messageSerializerDeserializer',  {protoBundle: require('../../common/proto/bundle.json')});
        this.diContainer.configure('assetManager', {filepaths: config.assets});
    }

    async start() {
        this.messageSerializerDeserializer = await this.diContainer.get('messageSerializerDeserializer');
        this.stateManager = await this.diContainer.get('authoritativeStateManager');
        this.stateManager.registerGameObjectType(gameObjectTypes.SPACESHIP, spaceFighterFactory, controllers.REMOTE_SPACE_FIGHTER_CONTROLLER);

        this.socketServer = new SocketServer(config.socketFilePath, this.messageSerializerDeserializer, this.stateManager);
        this.stateDispatcher = new StateDispatcher(this.stateManager, this.socketServer, this.messageSerializerDeserializer)
        this.simulation = new Simulation(this.stateManager);
        this.simulation.onIterCompleted(this.stateDispatcher.handleStateUpdated);

        this.socketServer.start();
        this.simulation.startGameLoop();

        process.on('SIGINT', this.shutdown.bind(this));
    }

    shutdown() {
        if (!this.shuttingDown && this.socketServer) {
            this.shuttingDown = true;
            logger.info('Terminating');

            this.socketServer.cleanup();

            process.exit(0);
        }
    }

}

(new GameServer()).start();
