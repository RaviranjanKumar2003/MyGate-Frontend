import SockJS from "sockjs-client";
import Stomp from "stompjs";

const socket = new SockJS("http://localhost:9090/call-socket");
const stompClient = Stomp.over(socket);

export default stompClient;