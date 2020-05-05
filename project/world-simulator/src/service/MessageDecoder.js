const protobuf = require("protobufjs");

const config = require("../config");
const logger = require('../utils/logger');

class MessageDecoder {

    loadProtoDefinitions() {
        return protobuf.load(config.protoDir + "/helloworld.proto") // "awesome.proto")
                .then((root) => {
                    this.HelloWorld = root.lookupType("helloworld.HelloWorld");
                    return Promise.resolve();
                });
    }

    /**
     * @param {Buffer} buffer
     */
    decodeMsgs(buffer) {
        const msgs = [];
        while (buffer.length) {
            const size = buffer.readUInt32LE();
            logger.debug('Msg size: ' + size);

            buffer = buffer.slice(4);
            const decodedMsg = this.HelloWorld.decode(buffer.slice(0, size));
            buffer = buffer.slice(size);

            msgs.push(decodedMsg);

            logger.debug('Msg decoded: ' + JSON.stringify(decodedMsg));
        }
    }

}

module.exports = MessageDecoder;