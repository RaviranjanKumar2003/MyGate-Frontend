import { useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function ChatVideoCall({ roomName, onClose }) {

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
      container: document.getElementById("zego-video"),
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      onLeaveRoom: () => {
        onClose(); // 🔴 call end
      }
    });

  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div id="zego-video" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default ChatVideoCall;