/**
 * @typedef {import('./SocketServer')} SocketServer
 * @typedef {import('../engine/state/StateManager').default} StateManager
 * @typedef {import('../engine/net/format/MessageSerializerDeserializer').default} MessageSerializerDeserializer
 */

const packetPeriodMs = require('../config').packetPeriodMs;
const logger = require('../utils/logger');

class StateDispatcher {

    /**
     * @param {StateManager} stateManager 
     * @param {SocketServer} socketServer 
     * @param {MessageSerializerDeserializer} messageSerializerDeserializer
     */
    constructor(stateManager, socketServer, messageSerializerDeserializer) {
        this.stateManager = stateManager;
        this.socketServer = socketServer;
        this.messageSerializerDeserializer = messageSerializerDeserializer;
        this.lastDispatchTimestamp = Date.now();
    }

    handleStateUpdated = () => {
        const timestamp = Date.now();
        if ((timestamp - this.lastDispatchTimestamp) > packetPeriodMs) {
            logger.debug('Dispatching new state');
            this.lastDispatchTimestamp = timestamp;
            this.dispatchState();
        }
    };

    dispatchState() {
        /*const objectStates = [];
        for (const object of this.stateManager.allObjects) {
            const data = {
                id: object.id,
                objectType: 1,
                position: this.messageEncoderDecoder.convertVector(object.object3d.position)
            };

            if (object.quaternion) {
                data.quaternion = this.messageEncoderDecoder.convertQuaternion(object.quaternion);
            }
            if (object.velocity) {
                data.velocity = this.messageEncoderDecoder.convertVector(object.velocity);
            }
            if (object.acceleration) {
                data.acceleration = this.messageEncoderDecoder.convertVector(object.acceleration);
            }
            if (object.angularVelocity) {
                data.angularVelocity = this.messageEncoderDecoder.convertVector(object.angularVelocity);
            }
            if (object.angularVelocity) {
                data.wVelocity = this.messageEncoderDecoder.convertVector(object.angularVelocity);
            }
            if (object.angularAcceleration) {
                data.wAcceleration = this.messageEncoderDecoder.convertVector(object.angularAcceleration);
            }
            
            objectStates.push(this.messageEncoderDecoder.ObjectState.create(data));
        }

        const WorldState = this.messageEncoderDecoder.WorldState;
        const encoded = this.messageEncoderDecoder.encode(WorldState, WorldState.create({objectStates}));
        this.socketServer.broadcast(encoded);*/
    }

}

module.exports = StateDispatcher;
