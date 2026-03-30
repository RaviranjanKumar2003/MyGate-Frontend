import { JitsiMeeting } from "@jitsi/react-sdk";

function ChatVideoCall({ roomName, onClose }) {

  return (

    <div className="fixed inset-0 bg-black z-50">

      <div className="absolute top-3 right-3 z-50">
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      </div>

      <JitsiMeeting
        roomName={roomName}

        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false
        }}

        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }}

        getIFrameRef={(iframe) => {
          iframe.style.height = "100vh";
          iframe.style.width = "100%";
        }}
      />

    </div>

  );

}

export default ChatVideoCall;