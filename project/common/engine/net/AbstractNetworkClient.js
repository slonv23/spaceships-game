export default class AbstractNetworkClient {

    /** @type {String} */
    serverAddress;

    postConstruct({serverAddress}) {
        this.serverAddress = serverAddress;
    }

    connect() {
        throw new Error("Not implemented");
    }

}