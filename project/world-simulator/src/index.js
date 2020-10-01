// initialize required modules
import './polyfills'
import './engine/net/format';
import './engine/state/authoritative-state-manager';
import './engine/asset-management';

import Engine from './engine';
import {config as engineConfig} from './engine/globals';
import {gameObjectTypes} from './constants';
import ProjectileSequenceController from "./engine/object-control/projectile/ProjectileSequenceController";
import RemoteSpaceFighterController from "./engine/object-control/space-fighter/RemoteSpaceFighterController";

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
        this.stateManager = await this.diContainer.get('stateManager');

        const projectileSequenceControllerFactory = await this.diContainer.createFactory(ProjectileSequenceController);
        this.diContainer.provide('projectileSequenceControllerFactory', projectileSequenceControllerFactory);
        const remoteSpaceFighterControllerFactory = await this.diContainer.createFactory(RemoteSpaceFighterController);

        this.stateManager.associateControllerFactoryWithGameObjectType(gameObjectTypes.SPACESHIP,
                                                                       remoteSpaceFighterControllerFactory);

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
