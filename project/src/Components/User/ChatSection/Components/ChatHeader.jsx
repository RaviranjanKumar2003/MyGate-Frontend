// import React from "react";
// import { Phone, Video, Search, MoreVertical } from "lucide-react";
// import stompClient from "../../../../socket";

// function ChatHeader({
//   userProfile,
//   USER_NAME,
//   SOCIETY_ID,
//   setRoomName,
//   setCallType,
//   setStartCall,
//   playCallingRing,
//   setOpenThreeDot
// }) {

//   const getProfileImage = (id) =>
//     `http://localhost:8080/api/users/image/get/user/${id}`;

//   /* AUDIO CALL */
//   const handleAudioCall = () => {
//     const room = `audio-${SOCIETY_ID}-${Date.now()}`;

//     stompClient.send(
//       "/app/start-call",
//       {},
//       JSON.stringify({
//         roomName: room,
//         callerName: USER_NAME,
//         type: "audio"
//       })
//     );

//     playCallingRing();
//     setRoomName(room);
//     setCallType("audio");
//     setStartCall(true);
//   };

//   /* VIDEO CALL */
//   const handleVideoCall = () => {
//     const room = `video-${SOCIETY_ID}-${Date.now()}`;

//     stompClient.send(
//       "/app/start-call",
//       {},
//       JSON.stringify({
//         roomName: room,
//         callerName: USER_NAME,
//         type: "video"
//       })
//     );

//     playCallingRing();
//     setRoomName(room);
//     setCallType("video");
//     setStartCall(true);
//   };

//   return (
//     <div className="bg-gray-200 flex items-center justify-between px-4 py-2 shadow">

//       {/* LEFT SIDE */}
//       <div className="flex items-center gap-3">

//         {userProfile && (
//           <img
//             src={getProfileImage(userProfile.id)}
//             className="w-9 h-9 rounded-full object-cover"
//             alt="profile"
//           />
//         )}

//         <div>
//           <p className="font-medium">{userProfile?.name}</p>
//           <p className="text-xs text-gray-500">Community Chat</p>
//         </div>

//       </div>

//       {/* RIGHT SIDE */}
//       <div className="flex items-center gap-4">

//         {/* AUDIO CALL */}
//         <Phone
//           size={20}
//           className="cursor-pointer"
//           onClick={handleAudioCall}
//         />

//         {/* VIDEO CALL */}
//         <Video
//           size={20}
//           className="cursor-pointer"
//           onClick={handleVideoCall}
//         />

//         {/* SEARCH */}
//         <Search size={20} className="cursor-pointer" />

//         {/* THREE DOT */}
//         <MoreVertical
//           size={20}
//           className="cursor-pointer"
//           onClick={() => setOpenThreeDot(true)}
//         />

//       </div>

//     </div>
//   );
// }

// export default ChatHeader;