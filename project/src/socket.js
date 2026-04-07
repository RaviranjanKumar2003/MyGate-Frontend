import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const WS_BASE = BASE_URL.replace("/api", "");
const WS_URL = `${WS_BASE}/ws`;

const stompClient = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  reconnectDelay: 5000,

  onConnect: () => {
    console.log("✅ Connected to:", WS_URL);

    // ✅ INCOMING CALL LISTEN
    stompClient.subscribe("/topic/incoming-call", (message) => {
      const data = JSON.parse(message.body);
      console.log("📞 Incoming Call:", data);

      // 👉 यहाँ popup / modal खोलो
      window.dispatchEvent(
        new CustomEvent("incoming-call", { detail: data })
      );
    });

    // ✅ END CALL LISTEN
    stompClient.subscribe("/topic/end-call", (message) => {
      const data = JSON.parse(message.body);
      console.log("❌ Call Ended:", data);

      window.dispatchEvent(
        new CustomEvent("call-ended", { detail: data })
      );
    });
  },

  onStompError: (frame) => {
    console.error("❌ Broker error:", frame);
  }
});

export default stompClient;