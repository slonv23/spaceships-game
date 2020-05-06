import AbstractNetworkClient from "./AbstractNetworkClient";

export default class WebRtcNetworkClient extends AbstractNetworkClient {

    /** @type {RTCPeerConnection} */
    peerConnection;

    /** @type {RTCDataChannel} */
    dataChannel;

    connect() {
        this._createPeerConnection();

    }

    _createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: [
                  "stun:global.stun:3478?transport=udp"
                ]
            }]
        });
    }

    _setupDataChannel() {
        this.dataChannel = this.peerConnection.createDataChannel('spaceships-main-channel');

        dataChannel.onopen = (e) => {
        };
  
        dataChannel.onclose = () => {
        };
  
        dataChannel.onerror = function (e) {
        };
  
        dataChannel.onmessage = function (e) {
        };
    }

}