import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// API base
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// 👉 /api remove karke base nikaal rahe hain
const WS_BASE = BASE_URL.replace("/api", "");

// 👉 final websocket URL
const WS_URL = `${WS_BASE}/ws`;

const stompClient = new Client({
  webSocketFactory: () => new SockJS(WS_URL),

  reconnectDelay: 5000,

  onConnect: () => {
    console.log("✅ Connected to:", WS_URL);
  },

  onStompError: (frame) => {
    console.error("❌ Broker error:", frame);
  }
});

export default stompClient;