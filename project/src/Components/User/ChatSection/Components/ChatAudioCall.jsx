import { useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function ChatAudioCall({ roomName, onClose }) {

  useEffect(() => {

    const appID = 605040740;
    const serverSecret = "5ea0cdbd8bd7b8d3e133bc245eb1302d";

    const userID = Date.now().toString();
    const userName = "User_" + userID;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomName,
      userID,
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: document.getElementById("zego-audio"),
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      turnOnCameraWhenJoining: false,
      turnOnMicrophoneWhenJoining: true,
      onLeaveRoom: () => {
        onClose();
      }
    });

  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div id="zego-audio" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default ChatAudioCall;