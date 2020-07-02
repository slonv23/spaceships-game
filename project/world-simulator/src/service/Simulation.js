const logger = require('../utils/logger');

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
        /*if (timestamp < this.lastFrameTimeMs + this.timestep) {
            setTimeout(this.gameLoop);
            return;
        }*/

        let timeoutDelay = (timestamp - this.lastFrameTimeMs) - this.timestep; // ideal case when delay = 0
        if (timeoutDelay < 0) {
            timeoutDelay = 0;
        }

        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        while (this.delta >= this.timestep) {
            this.stateManager.update(this.timestep);
            this.delta -= this.timestep;
        }

        const afterStateUpdatedTimestamp = Date.now();
        const timeProcessing = afterStateUpdatedTimestamp - timestamp;

        let timeLeftToNextStateUpdate = this.timestep - (timeProcessing + timeoutDelay);

        if (timeLeftToNextStateUpdate < 0) {
            logger.warn(
                `State update took too much time
                 Lag: ${timeLeftToNextStateUpdate}
                 Time processing: ${timeProcessing}
                 Timeout delay: ${timeoutDelay}`
            );
            timeLeftToNextStateUpdate = 0;
        }

        setTimeout(this.gameLoop, timeLeftToNextStateUpdate);

        this.handleIterCompleted(this.frameIndex++);
        //logger.debug(`Next state update in ${timeLeftToNextStateUpdate} milliseconds`);
    };

}

module.exports = Simulation;
