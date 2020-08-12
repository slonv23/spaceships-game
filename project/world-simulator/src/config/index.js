const path = require("path");
const globalConfig = require("../../../config.json")

module.exports = {
    protoDir: path.resolve(__dirname, "../../../common/proto"),
    packetPeriodFrames: globalConfig.packetPeriodFrames,
    fps: globalConfig.fps,
    assets: {
        assets3d: {
            smallSpaceFighter: "SmallSpaceFighter.glb"
        },
    }
};
