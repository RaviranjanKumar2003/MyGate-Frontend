import { useEffect } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

function ChatVideoCall({ roomName, onClose }) {

  // 🔴 ESC key se close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // ✅ Dynamic room fix (MOST IMPORTANT)
  const finalRoomName = `room-${roomName}-${Date.now()}`;

  return (
    <div className="fixed inset-0 bg-black z-50">

      {/* 🔴 END CALL BUTTON */}
      <div className="absolute top-3 right-3 z-50">
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      </div>

      {/* 🎥 JITSI MEETING */}
      <JitsiMeeting
        roomName={finalRoomName}

        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, // ✅ skip waiting screen
        }}

        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }}

        getIFrameRef={(iframe) => {
          iframe.style.height = "100vh";
          iframe.style.width = "100%";
        }}

        onApiReady={(api) => {

          // ✅ Jab meeting join ho jaye
          api.addEventListener("videoConferenceJoined", () => {
            console.log("✅ Joined meeting");

            // 🔥 lobby disable (important)
            try {
              api.executeCommand("toggleLobby", false);
            } catch (e) {
              console.log("Lobby control not available");
            }
          });

          // 🔴 Jab user leave kare
          api.addEventListener("videoConferenceLeft", () => {
            onClose();
          });
        }}
      />

    </div>
  );
}

export default ChatVideoCall;