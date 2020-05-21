import AbstractNetworkClient from "./AbstractNetworkClient";

export default class WebRtcNetworkClient extends AbstractNetworkClient {

    /** @type {RTCPeerConnection} */
    peerConnection;

    /** @type {RTCDataChannel} */
    dataChannel;

    async connect() {
        try {
            this._createPeerConnection();
            this._setupDataChannel();

            const offer = await this._createOffer();
            const candidates = await this._gatherIceCandidates();
            await this._negotiateConnection(offer, candidates);
        } catch (e) {
            console.error("Failed to connect using WebRTC datachannel, error: " + e);
        }
    }

    _createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            /*iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302"
                ]
            }]*/
        });

        this.peerConnection.onicecandidateerror = e => {
            debugger;
            console.log(e);
        }
        window.myPeerConnection = this.peerConnection;
    }

    _setupDataChannel() {
        this.dataChannel = this.peerConnection.createDataChannel('testChannel'); // , {id: 1, negotiated: true}

        // this.peerConnection.createDataChannel('channel2');

        this.dataChannel.onopen = e => {
            debugger;
            console.debug('DataChannel ready: ' + e);
        };
  
        this.dataChannel.onclose = (e) => {
            debugger
            console.debug('DataChannel closed' + e);
        };
  
        this.dataChannel.onerror = e => {
            debugger;
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
        const candidates = [];

        return new Promise((resolve, reject) => {
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    debugger;
                    candidates.push(event.candidate);
                } else {
                    console.debug("All local candidates received");
                    resolve(candidates);
                }
            };
        })
    }

    /**
     * @param {RTCSessionDescriptionInit} offer 
     * @param {RTCIceCandidate[]} candidates 
     */
    async _negotiateConnection(offer, candidates) {
        debugger;
        const {answer, candidates: serverCandidates} = await this._requestAnswerAndCandidates(offer, candidates);
        debugger;
        const sessionDescription = new RTCSessionDescription({type: "answer", "sdp": answer});
        await this.peerConnection.setRemoteDescription(sessionDescription);
        for (let candidate of serverCandidates) {
            candidate = candidate.replace('172.19.0.2'/* docker ip */, '192.168.148.35'/* local ip */)
            debugger;
            // , sdpMLineIndex: 0
            const rtcIceCandidate = new RTCIceCandidate({candidate,  sdpMLineIndex: 0});
            await this.peerConnection.addIceCandidate(rtcIceCandidate);
        }
    }

    _requestAnswerAndCandidates(offer, candidates) {
        const params = new URLSearchParams();
        params.append("offer", offer.sdp);
        candidates.forEach(candidate => {
            params.append("candidates", candidate.candidate);
        });

        return fetch('http://127.0.0.1:8080/connect', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: params
            }).then((res) => {
                return res.text()
            }).then((paramsEncoded) => {
                const params = new URLSearchParams(paramsEncoded);

                return {
                    answer: params.get('answer'),
                    candidates: params.getAll('candidates')
                }
            });
    }

}