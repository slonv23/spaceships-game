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
     * @param {Buffer} msg 
     */
    decode(msg) {
        const size = msg.readInt16LE();
        logger.isInfo('Msg size: ' + size);

        msg = msg.slice(2);
        const decodedMsg = this.HelloWorld.decode(msg);

        logger.isInfo('Msg decoded: ' + JSON.stringify(decodedMsg));
    }

}

module.exports = MessageDecoder;