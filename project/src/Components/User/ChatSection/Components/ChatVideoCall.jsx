import { useEffect } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

function ChatVideoCall({ roomName, onClose }) {

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const finalRoomName = `room-${roomName}`;

  return (
    <div className="fixed inset-0 bg-black z-50">

      {/* END CALL BUTTON */}
      <div className="absolute top-3 right-3 z-50">
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      </div>

      <JitsiMeeting
        roomName={finalRoomName}

        configOverwrite={{
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
        }}

        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}

        userInfo={{
          displayName: "User",
        }}

        getIFrameRef={(iframe) => {
          iframe.style.height = "100vh";
          iframe.style.width = "100%";
        }}

        onApiReady={(api) => {

          console.log("🔥 API READY");

          // ✅ Force lobby off
          try {
            api.executeCommand("toggleLobby", false);
          // eslint-disable-next-line no-unused-vars
          } catch (e) { /* empty */ }

          // ✅ Auto join confirmation
          api.on("videoConferenceJoined", () => {
  console.log("✅ Joined");
});

          // 🔴 Close on leave
          api.on("videoConferenceJoined", () => {
  console.log("✅ Joined");
});
        }}
      />

    </div>
  );
}

export default ChatVideoCall;