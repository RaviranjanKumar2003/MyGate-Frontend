// // useCall.js
// import { useState, useRef, useEffect } from "react";

// export default function useCall() {
//   const [callActive, setCallActive] = useState(false);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [localStream, setLocalStream] = useState(null);

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnectionRef = useRef(null);

//   // default STUN server config
//   const servers = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       { urls: "stun:stun1.l.google.com:19302" },
//     ],
//   };

//   // start call (get user media + create peer connection)
//   const startCall = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);
//       if (localVideoRef.current) localVideoRef.current.srcObject = stream;

//       const pc = new RTCPeerConnection(servers);
//       peerConnectionRef.current = pc;

//       // add local tracks
//       stream.getTracks().forEach(track => pc.addTrack(track, stream));

//       // remote stream
//       const remote = new MediaStream();
//       setRemoteStream(remote);
//       if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;

//       pc.ontrack = (event) => {
//         event.streams[0].getTracks().forEach(track => remote.addTrack(track));
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           // send candidate to remote peer (via signaling server)
//           console.log("ICE candidate", event.candidate);
//         }
//       };

//       setCallActive(true);
//     } catch (err) {
//       console.error("Error starting call:", err);
//     }
//   };

//   const endCall = () => {
//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//       peerConnectionRef.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//       setLocalStream(null);
//     }
//     setRemoteStream(null);
//     setCallActive(false);
//   };

//   return {
//     callActive,
//     startCall,
//     endCall,
//     localStream,
//     remoteStream,
//     localVideoRef,
//     remoteVideoRef,
//   };
// }