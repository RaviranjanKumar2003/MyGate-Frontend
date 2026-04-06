import { useEffect } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

function ChatVideoCall({ roomName, onClose }) {

  // 🔴 ESC key se bhi close
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
        roomName={roomName}

        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false   // ✅ direct join
        }}

        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }}

        getIFrameRef={(iframe) => {
          iframe.style.height = "100vh";
          iframe.style.width = "100%";
        }}

        onApiReady={(externalApi) => {
          // 🔴 jab user manually call end kare (leave kare)
          externalApi.addListener("videoConferenceLeft", () => {
            onClose();
          });
        }}
      />

    </div>

  );

}

export default ChatVideoCall;