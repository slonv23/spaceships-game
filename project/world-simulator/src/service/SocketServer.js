/**
 * @typedef {import('../engine/net/format/MessageSerializerDeserializer').default} MessageSerializerDeserializer
 * @typedef {import('../engine/state/AuthoritativeStateManager').default} StateManager
 * @typedef {import('../engine/net/models/InputAction').default} InputAction
 * @typedef {import('net').Socket} Socket
 */
import FlyingObject from '../engine/physics/object/FlyingObject';
import {controllers} from '../engine/object-control';
import SpawnResponse from '../engine/net/models/SpawnResponse';
import {gameObjectTypes} from "../constants";

const logger = require('../utils/logger');
const net = require('net');
const fs = require('fs');

class SocketServer {

    /** @type {MessageSerializerDeserializer} */
    messageSerializerDeserializer;

    /** @type {object.<string, Socket>} */
    connections = {};

    /** @type {StateManager} */
    stateManager;

    constructor(sockerFilePath, messageSerializerDeserializer, stateManager) {
        this.sockerFilePath = sockerFilePath;
        this.messageSerializerDeserializer = messageSerializerDeserializer;
        this.stateManager = stateManager;
    }

    async start() {
        // check for failed cleanup
        logger.debug('Checking for leftover socket');

        // eslint-disable-next-line no-unused-vars
        fs.stat(this.sockerFilePath, (err, stats) => {
            if (err) {
                // start server
                logger.debug('No leftover socket found');
                this._createServer();
            } else {
                // remove file then start server
                logger.debug('Removing leftover socket')
                fs.unlink(this.sockerFilePath, (err) => {
                    if (err) {
                        // this should never happen
                        logger.error(err);
                    }

                    this._createServer();
                });
            }
        });
    }

    cleanup() {
        if (this.server) {
            Object.keys(this.connections).forEach(clientId => {
                // TODO send some termination command
                // connections[clientId].write('__disconnect');
                this.connections[clientId].end();
            });

            this.server.close();
        }
    }

    broadcast(data) {
        for (const clientId in this.connections) {
            this.connections[clientId].write(data, (err) => {
                if (err) {
                    logger.warn("Failed to write to socket, error: " + err);
                }
            });
        }
    }

    _handleClientDisconnected(clientId) {
        logger.debug(`Client #${clientId} disconnected`);
        delete this.connections[clientId];
    }

    async _handleDataReceived(clientId, data) {
        try {
            const messages = this.messageSerializerDeserializer.deserializeRequest(data);
            for (const message of messages) {
                //logger.debug("Incoming message: " + JSON.stringify(message));

                switch (message.constructor.name) {
                    case "SpawnRequest":
                        await this._handleSpawnRequest(message);
                        break;
                    case "InputAction":
                        await this._handleInputAction(message);
                        break;
                }
            }
        } catch (err) {
            logger.logError('Failed to process data received on socket', err);
        }
    }

    async _handleSpawnRequest(message) {
        const controller = await this.stateManager.createObject(null, gameObjectTypes.SPACESHIP);

        const spawnResponse = new SpawnResponse();
        spawnResponse.assignedObjectId = controller.gameObject.id;

        const serializedMessage = this.messageSerializerDeserializer.serializeResponse(spawnResponse, {requestId: message._requestId});
        this.broadcast(serializedMessage);
    }

    /**
     * @param {InputAction} message
     * @returns {Promise<void>}
     * @private
     */
    async _handleInputAction(message) {
        if (this.stateManager.currentFrameIndex >= message.frameIndex) {
            logger.debug(`Input action was scheduled by client at frame #${message.frameIndex}` +
                         ` but will be added at frame #${this.stateManager.currentFrameIndex + 1}`);
            message.frameIndex = this.stateManager.currentFrameIndex + 1;
        }

        this.stateManager.addInputAction(message.objectId, message);
    }

    _createServer() {
        logger.info('Creating socket server...');

        this.server = net.createServer(stream => {
            logger.debug('Connection acknowledged');

            const clientId = Date.now();
            this.connections[clientId] = stream;
            stream.on('end', this._handleClientDisconnected.bind(this, clientId));
            stream.on('data', this._handleDataReceived.bind(this, clientId));
        })
        .listen(this.sockerFilePath)
        .on('listening', () => {
            logger.info('Socket server started');
        });
    }

}

module.exports = SocketServer;
