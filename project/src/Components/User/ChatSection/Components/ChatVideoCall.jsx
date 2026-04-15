import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useEffect, useRef } from "react";

const ChatVideoCall = ({ roomName, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {

    console.log("ROOM:", roomName);

    if (!roomName) {
      console.error("❌ roomName missing");
      return;
    }

    const appID = 605040740;
    const serverSecret = "YOUR_NEW_SECRET_HERE";

    if (!appID || !serverSecret) {
      console.error("❌ Zego credentials missing");
      return;
    }

    const userID = String(Date.now());
    const userName = "User_" + userID;

    let kitToken;

    try {
      kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomName,
        userID,
        userName
      );
    } catch (err) {
      console.error("❌ Token generation failed:", err);
      return;
    }

    if (!kitToken) {
      console.error("❌ kitToken is null/undefined");
      return;
    }

    

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      onLeaveRoom: onClose,
    });

  }, [roomName]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ChatVideoCall;