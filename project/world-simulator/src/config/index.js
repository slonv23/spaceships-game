const path = require("path");
const globalConfig = require("../../../config.json")

module.exports = {
    socketFilePath: '/tmp/spaceships-world-simulator.sock',
    protoDir: path.resolve(__dirname, "../../../common/proto"),
    packetPeriodFrames: globalConfig.packetPeriodFrames,
    fps: globalConfig.fps,
    simulateStateDrops: false,
    assets: {
        assets3d: {
            spaceFighter: "StarSparrow2.glb"
            //smallSpaceFighter: "SmallSpaceFighter.glb"
        },
    }
};
