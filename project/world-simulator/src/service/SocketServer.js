/**
 * @typedef {import('../engine/net/format/MessageSerializerDeserializer').default} MessageSerializerDeserializer
 * @typedef {import('net').Socket} Socket
 */

const logger = require('../utils/logger');
const net = require('net');
const fs = require('fs');

class SocketServer {

    /** @type {MessageSerializerDeserializer} */
    messageSerializerDeserializer;

    /** @type {object.<string, Socket>} */
    connections = {};

    constructor(sockerFilePath, messageSerializerDeserializer) {
        this.sockerFilePath = sockerFilePath;
        this.messageSerializerDeserializer = messageSerializerDeserializer;
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

    _handleDataReceived(clientId, data) {
        const messages = this.messageSerializerDeserializer.deserializeRequest(data);
        for (const message of messages) {
            if (!message.message) {
                // not a valid message, should have message type
                continue;
            }

            switch (message.message) {
                case "spawnRequest":
                    // message.requestId
                    break;
            }

            logger.debug("Incoming message: " + JSON.stringify(message));
        }
    }

    _createServer() {
        logger.info('Creating socket server...');

        this.server = net.createServer(stream => {
            logger.debug('Connection acknowledged');

            const clientId = Date.now();
            this.connections[clientId] = stream;
            //stream.
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
