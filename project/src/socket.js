import SockJS from "sockjs-client";
import Stomp from "stompjs";

const socket = new SockJS("https://mygate-backend-tmre.onrender.com/call-socket");
const stompClient = Stomp.over(socket);

export default stompClient;