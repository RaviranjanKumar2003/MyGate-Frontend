import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socket = new SockJS("https://mygate-backend-tmre.onrender.com/ws");

const stompClient = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,

  onConnect: () => {
    console.log("✅ Connected");
  },

  onStompError: (frame) => {
    console.error("❌ Broker error:", frame);
  }
});

export default stompClient;