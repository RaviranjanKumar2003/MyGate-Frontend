import { useEffect, useRef } from "react";

function ChatVideoCall({ roomName, onClose }) {
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    const domain = "meet.jit.si";

    const options = {
      roomName: `room-${roomName}`, // ✅ stable room (same for both users)
      parentNode: jitsiContainerRef.current,

      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false, // ✅ NO JOIN SCREEN
      },

      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    // ✅ meeting join
    api.addListener("videoConferenceJoined", () => {
      console.log("✅ Call Connected");
    });

    // 🔴 leave event
    api.addListener("videoConferenceLeft", () => {
      onClose();
    });

    return () => {
      api.dispose();
    };
  }, [roomName, onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50">

      {/* END CALL */}
      <div className="absolute top-3 right-3 z-50">
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      </div>

      {/* JITSI VIDEO */}
      <div
        ref={jitsiContainerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default ChatVideoCall;