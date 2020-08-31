/**
 * @typedef {import('./SocketServer')} SocketServer
 * @typedef {import('../engine/state/AuthoritativeStateManager').default} AuthoritativeStateManager
 * @typedef {import('../engine/net/models/ObjectAction').default} ObjectAction
 * @typedef {import('../engine/physics/object/AbstractObject').default} AbstractObject
 * @typedef {import('../engine/net/format/MessageSerializerDeserializer').default} MessageSerializerDeserializer
 * @typedef {import('../engine/physics/object/FlyingObject').default} FlyingObject
 * @typedef {import('../engine/object-control/AbstractObjectController').default} AbstractObjectController
 * @typedef {import('../engine/object-control/space-fighter/RemoteSpaceFighterController').default} RemoteSpaceFighterController
 */
import ObjectState from "../engine/net/models/ObjectState";
import WorldState from "../engine/net/models/WorldState";
import SpaceFighterState from "../engine/net/models/space-fighter/SpaceFighterState";
import {gameObjectTypes} from "../constants";

const packetPeriodFrames = require('../config').packetPeriodFrames;
//const logger = require('../utils/logger');

class StateDispatcher {

    lastDispatchedFrameIndex = 0;

    processedObjectActionsByObjectId = {};

    /**
     * @param {AuthoritativeStateManager} authoritativeStateManager
     * @param {SocketServer} socketServer
     * @param {MessageSerializerDeserializer} messageSerializerDeserializer
     */
    constructor(authoritativeStateManager, socketServer, messageSerializerDeserializer) {
        this.stateManager = authoritativeStateManager;
        this.socketServer = socketServer;
        this.messageSerializerDeserializer = messageSerializerDeserializer;

        this.stateManager.addEventListener('game-object-created', this.handleGameObjectCreated);
        this.stateManager.addEventListener('actions-processed', this.handleObjectActionProcessed);
    }

    handleStateUpdated = (frameIndex) => {
        if ((frameIndex - this.lastDispatchedFrameIndex) >= packetPeriodFrames) {
            //logger.debug('Dispatching new state');
            this.lastDispatchedFrameIndex = frameIndex;
            this.dispatchState(this.stateManager.currentFrameIndex);
        }
    };

    handleGameObjectCreated = (event) => {
        /** @type {AbstractObjectController} controller */
        const controller = event.detail;
        this.processedObjectActionsByObjectId[controller.gameObject.id] = [];
    }


    handleObjectActionProcessed = (event) => {
        /** @type {ObjectAction[]} */
        const actions = event.detail;
        const actionsCount = actions.length;
        for (let i = 0; i < actionsCount; i++) {
            const action = actions[i];
            this.processedObjectActionsByObjectId[action.objectId].push(action);
        }
    };

    dispatchState(frameIndex) {
        const objectStates = [];
        for (/** @type {RemoteSpaceFighterController} */ const objectController of this.stateManager.initializedControllers) {
            /** @type {FlyingObject} */
            const object = objectController.gameObject;
            const spaceFighterState = new SpaceFighterState();

            const objectState = new ObjectState();
            objectState.id = object.id;
            objectState.objectType = gameObjectTypes.SPACESHIP;
            objectState.state = this.messageSerializerDeserializer.getFieldNameInsideOneOfForModel(spaceFighterState);
            objectState.spaceFighterState = spaceFighterState;

            spaceFighterState.rollAngleBtwCurrentAndTargetOrientation = object.rollAngleBtwCurrentAndTargetOrientation;
            spaceFighterState.controlQuaternion = objectController.controlsQuaternion;
            spaceFighterState.speed = object.velocity.z;
            //spaceFighterState.angularAcceleration = object.angularAcceleration;
            spaceFighterState.angularVelocity = object.angularVelocity;
            spaceFighterState.position = object.position;
            spaceFighterState.quaternion = object.quaternion;
            spaceFighterState.actions = this.processedObjectActionsByObjectId[object.id];

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
        for (const objectId in this.processedObjectActionsByObjectId) {
            this.processedObjectActionsByObjectId[objectId] = [];
        }
    }

}

module.exports = StateDispatcher;
