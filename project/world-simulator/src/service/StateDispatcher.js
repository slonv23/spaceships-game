/**
 * @typedef {import('./SocketServer')} SocketServer
 * @typedef {import('../engine/state/AuthoritativeStateManager').default} AuthoritativeStateManager
 * @typedef {import('../engine/net/format/MessageSerializerDeserializer').default} MessageSerializerDeserializer
 * @typedef {import('../engine/physics/object/FlyingObject').default} FlyingObject
 * @typedef {import('../engine/object-control/flying-object/RemoteFlyingObjectController').default} RemoteFlyingObjectController
 */
import ObjectState from "../engine/net/models/ObjectState";
import objectTypes from "../engine/physics/object";
import WorldState from "../engine/net/models/WorldState";

const packetPeriodMs = require('../config').packetPeriodMs;
//const logger = require('../utils/logger');

class StateDispatcher {

    /**
     * @param {AuthoritativeStateManager} authoritativeStateManager
     * @param {SocketServer} socketServer
     * @param {MessageSerializerDeserializer} messageSerializerDeserializer
     */
    constructor(authoritativeStateManager, socketServer, messageSerializerDeserializer) {
        this.stateManager = authoritativeStateManager;
        this.socketServer = socketServer;
        this.messageSerializerDeserializer = messageSerializerDeserializer;
        this.lastDispatchTimestamp = Date.now();
    }

    handleStateUpdated = () => {
        const timestamp = Date.now();
        if ((timestamp - this.lastDispatchTimestamp) >= packetPeriodMs) {
            //logger.debug('Dispatching new state');
            this.lastDispatchTimestamp = timestamp;
            this.dispatchState(this.stateManager.currentFrameIndex);
        }
    };

    dispatchState(frameIndex) {
        const objectStates = [];
        for (/** @type {RemoteFlyingObjectController} */ const objectController of this.stateManager.controllers) {
            /** @type {FlyingObject} */
            const object = objectController.gameObject;
            const objectState = new ObjectState();

            objectState.id = object.id;
            objectState.rollAngleBtwCurrentAndTargetOrientation = object.rollAngleBtwCurrentAndTargetOrientation;
            objectState.controlQuaternion = objectController.controlsQuaternion;
            objectState.speed = object.velocity.z;
            objectState.objectType = objectTypes.FLYING_OBJECT;
            //objectState.angularAcceleration = object.angularAcceleration;
            objectState.angularVelocity = object.angularVelocity;
            objectState.position = object.position;
            objectState.quaternion = object.quaternion;
            objectState.actions = [];

            objectStates.push(objectState);
        }

        const worldState = new WorldState();
        worldState.objectStates = objectStates;
        worldState.frameIndex = frameIndex;

        const serializedResponse = this.messageSerializerDeserializer.serializeResponse(worldState, {requestId: 0});
        this.socketServer.broadcast(serializedResponse);

        //const deserialized = this.messageSerializerDeserializer.deserializeResponse(serializedResponse);
        //console.log("deserialized: " + JSON.stringify(deserialized));
    }

}

module.exports = StateDispatcher;
