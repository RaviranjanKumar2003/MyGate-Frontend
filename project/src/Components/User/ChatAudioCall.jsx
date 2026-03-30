import React, { useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff } from "lucide-react";

function ChatAudioCall({ roomName, onClose }) {

  const localStream = useRef(null);

  useEffect(() => {

    const startAudio = async () => {
      try {

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });

        localStream.current = stream;

      } catch (err) {
        console.error("Audio permission error:", err);
      }
    };

    startAudio();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };

  }, []);

  const toggleMute = () => {

    if (!localStream.current) return;

    const audioTrack = localStream.current.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }

  };

  return (

    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">

      <h2 className="text-xl font-semibold mb-2">Audio Call</h2>

      <p className="text-sm opacity-80 mb-6">
        Room: {roomName}
      </p>

      <div className="flex gap-6">

        {/* MUTE BUTTON */}

        <button
          onClick={toggleMute}
          className="bg-gray-700 p-4 rounded-full"
        >
          <Mic size={22}/>
        </button>

        {/* END CALL */}

        <button
          onClick={onClose}
          className="bg-red-500 p-4 rounded-full"
        >
          <PhoneOff size={22}/>
        </button>

      </div>

    </div>

  );

}

export default ChatAudioCall;