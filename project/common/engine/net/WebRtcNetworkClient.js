import AbstractNetworkClient from "./AbstractNetworkClient";

export default class WebRtcNetworkClient extends AbstractNetworkClient {

    /** @type {RTCPeerConnection} */
    peerConnection;

    /** @type {RTCDataChannel} */
    dataChannel;

    candidates = [];

    async connect() {
        this._createPeerConnection();
        this._setupDataChannel();



        debugger;

        const offer = await this._createOffer();
        await this._gatherIceCandidates();

        debugger;
    }

    _createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302" // this work (06.05.2020)
                    // "stun:global.stun:3478?transport=udp" // this not work anymore
                ]
            }]
        });
    }

    _setupDataChannel() {
        this.dataChannel = this.peerConnection.createDataChannel('spaceships-main-channel');

        this.dataChannel.onopen = e => {
            console.debug('DataChannel ready');
        };
  
        this.dataChannel.onclose = () => {
            console.debug('DataChannel closed');
        };
  
        this.dataChannel.onerror = e => {
            console.error('DataChannel error: ' + e);
        };
  
        this.dataChannel.onmessage = e => {
            console.debug('DataChannel received message: ' + e.data);
        };
    }

    _createOffer() {
        return this.peerConnection.createOffer().then((offer) => {
            this.peerConnection.setLocalDescription(offer);
            return offer;
        });
    }

    _gatherIceCandidates() {
        return new Promise((resolve, reject) => {
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.candidates.push(event.candidate);
                } else {
                    console.debug("All local candidates received");
                    resolve();
                }
            };
        })
    }

}