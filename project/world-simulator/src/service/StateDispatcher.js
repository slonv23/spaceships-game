/**
 * @typedef {import('./SocketServer')} SocketServer
 * @typedef {import('../engine/state/AuthoritativeStateManager').default} AuthoritativeStateManager
 * @typedef {import('../engine/net/models/InputAction').default} InputAction
 * @typedef {import('../engine/physics/object/AbstractObject').default} AbstractObject
 * @typedef {import('../engine/net/format/MessageSerializerDeserializer').default} MessageSerializerDeserializer
 * @typedef {import('../engine/physics/object/FlyingObject').default} FlyingObject
 * @typedef {import('../engine/object-control/flying-object/RemoteFlyingObjectController').default} RemoteFlyingObjectController
 */
import ObjectState from "../engine/net/models/ObjectState";
import objectTypes from "../engine/physics/object";
import WorldState from "../engine/net/models/WorldState";

const packetPeriodFrames = require('../config').packetPeriodFrames;
//const logger = require('../utils/logger');

class StateDispatcher {

    lastDispatchedFrameIndex = 0;

    processedInputActionsByObjectId = {};

    /**
     * @param {AuthoritativeStateManager} authoritativeStateManager
     * @param {SocketServer} socketServer
     * @param {MessageSerializerDeserializer} messageSerializerDeserializer
     */
    constructor(authoritativeStateManager, socketServer, messageSerializerDeserializer) {
        this.stateManager = authoritativeStateManager;
        this.socketServer = socketServer;
        this.messageSerializerDeserializer = messageSerializerDeserializer;

        this.stateManager.addEventListener('object-created', this.handleObjectCreated);
        this.stateManager.addEventListener('actions-processed', this.handleInputActionProcessed);
    }

    handleStateUpdated = (frameIndex) => {
        if ((frameIndex - this.lastDispatchedFrameIndex) >= packetPeriodFrames) {
            //logger.debug('Dispatching new state');
            this.lastDispatchedFrameIndex = frameIndex;
            this.dispatchState(this.stateManager.currentFrameIndex);
        }
    };

    handleObjectCreated = (event) => {
        /** @type {AbstractObject} gameObject */
        const gameObject = event.detail;
        this.processedInputActionsByObjectId[gameObject.id] = [];
    }


    handleInputActionProcessed = (event) => {
        /** @type {InputAction[]} */
        const actions = event.detail;
        const actionsCount = actions.length;
        for (let i = 0; i < actionsCount; i++) {
            const action = actions[i];
            this.processedInputActionsByObjectId[action.objectId].push(action);
        }
    };

    dispatchState(frameIndex) {
        const objectStates = [];
        for (/** @type {RemoteFlyingObjectController} */ const objectController of this.stateManager.initializedControllers) {
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
            objectState.actions = this.processedInputActionsByObjectId[object.id];

            objectStates.push(objectState);
        }

        const worldState = new WorldState();
        worldState.objectStates = objectStates;
        worldState.frameIndex = frameIndex;

        const serializedResponse = this.messageSerializerDeserializer.serializeResponse(worldState, {requestId: 0});
        this.socketServer.broadcast(serializedResponse);

        this._cleanup();

        //const deserialized = this.messageSerializerDeserializer.deserializeResponse(serializedResponse);
        //console.log("deserialized: " + JSON.stringify(deserialized));
    }

    _cleanup() {
        for (const objectId in this.processedInputActionsByObjectId) {
            this.processedInputActionsByObjectId[objectId] = [];
        }
    }

}

module.exports = StateDispatcher;
