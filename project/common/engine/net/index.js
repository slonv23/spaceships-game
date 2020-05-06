import {diContainer} from '../globals';
import WebRtcNetworkClient from './WebRtcNetworkClient';

diContainer.registerClass("webRtcNetworkClient", WebRtcNetworkClient, {serverAddress: '127.0.0.1'});