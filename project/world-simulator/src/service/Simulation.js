const logger = require('../utils/logger');
// eslint-disable-next-line no-unused-vars
//const process = require('process');

class Simulation {

    /** Timing */
    lastFrameTimeMs;
    maxFPS = 60;
    delta = 0;
    timestep = 1000 / 60;
    frameIndex = 0;

    handleIterCompleted = () => {};

    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    onIterCompleted(callback) {
        this.handleIterCompleted = callback;
    }

    startGameLoop() {
        setTimeout(() => {
            this.lastFrameTimeMs = Date.now();

            setTimeout(this.gameLoop, this.timestep);
        }, this.timestep);
    }

    gameLoop = () => {
        const timestamp = Date.now();
        let timeoutDelay = (timestamp - this.lastFrameTimeMs) - this.timestep; // ideal case when delay = 0
        if (timeoutDelay < 0) {
            timeoutDelay = 0;
            //process.nextTick(this.gameLoop);
            setImmediate(this.gameLoop); // set immediate should provide most accurate ticks but loads 100% of cpu
            return;
        }

        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        while (this.delta >= this.timestep) {
            this.frameIndex++;
            this.stateManager.update(this.timestep);
            this.delta -= this.timestep;
        }

        const afterStateUpdatedTimestamp = Date.now();
        const timeProcessing = afterStateUpdatedTimestamp - timestamp;

        let timeLeftToNextStateUpdate = this.timestep - (timeProcessing + timeoutDelay);

        if (timeLeftToNextStateUpdate < 0) {
            logger.warn(
                `State update took too much time
                 Lag: ${-timeLeftToNextStateUpdate}
                 Time processing: ${timeProcessing}
                 Timeout delay: ${timeoutDelay}`
            );
            timeLeftToNextStateUpdate = 0;
        }

        //setTimeout(this.gameLoop, timeLeftToNextStateUpdate);
        //process.nextTick(this.gameLoop);
        setImmediate(this.gameLoop);

        this.handleIterCompleted(this.frameIndex);
        //logger.debug(`Next state update in ${timeLeftToNextStateUpdate} milliseconds`);
    };

}

module.exports = Simulation;
