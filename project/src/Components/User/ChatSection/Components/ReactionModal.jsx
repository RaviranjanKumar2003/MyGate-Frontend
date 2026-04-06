// import React, { useState } from "react";
// import EmojiPicker from "emoji-picker-react";

// function ReactionModal({
//   reactionUsers,
//   USER_ID,
//   emojiCounts,
//   selectedEmoji,
//   setSelectedEmoji,
//   removeReaction,
//   updateReaction,
//   close
// }) {

//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   /* SORT: current user on top */
//   const sortedUsers = [...reactionUsers].sort((a, b) => {
//     if (a.userId == USER_ID) return -1;
//     if (b.userId == USER_ID) return 1;
//     return 0;
//   });

//   /* FILTER */
//   const filteredUsers =
//     selectedEmoji === "ALL"
//       ? sortedUsers
//       : sortedUsers.filter((u) => u.emoji === selectedEmoji);

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">

//       <div className="bg-white w-80 rounded-xl p-4 shadow-lg">

//         {/* TOP FILTER */}
//         <div className="flex items-center justify-between mb-3">

//           <div className="flex gap-2 flex-wrap">

//             {/* ALL */}
//             <span
//               onClick={() => setSelectedEmoji("ALL")}
//               className={`px-2 py-1 rounded-full text-sm cursor-pointer
//               ${selectedEmoji === "ALL"
//                   ? "bg-green-500 text-white"
//                   : "bg-gray-200"}`}
//             >
//               All {reactionUsers.length}
//             </span>

//             {/* EMOJI FILTER */}
//             {Object.entries(emojiCounts).map(([emoji, count]) => (
//               <span
//                 key={emoji}
//                 onClick={() => setSelectedEmoji(emoji)}
//                 className={`px-2 py-1 rounded-full text-sm cursor-pointer
//                 ${selectedEmoji === emoji
//                     ? "bg-green-500 text-white"
//                     : "bg-gray-200"}`}
//               >
//                 {emoji} {count}
//               </span>
//             ))}

//           </div>

//           {/* ADD EMOJI BUTTON */}
//           <button
//             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//             className="text-xl px-2 py-1 rounded-full border cursor-pointer relative"
//           >
//             😀
//             <span className="absolute bg-green-500 text-black text-[10px] w-4 h-4 flex items-center justify-center -top-2 -right-2 rounded-full">
//               +
//             </span>
//           </button>

//         </div>

//         {/* EMOJI PICKER */}
//         {showEmojiPicker ? (

//           <div className="w-full">
//             <EmojiPicker
//               height={300}
//               width="100%"
//               onEmojiClick={(e) => {
//                 updateReaction(e.emoji);
//                 setShowEmojiPicker(false);
//               }}
//             />
//           </div>

//         ) : (

//           /* USER LIST */
//           <div className="max-h-60 overflow-y-auto">

//             {filteredUsers.map((user, i) => {

//               const isMe = user.userId == USER_ID;

//               return (
//                 <div
//                   key={i}
//                   onClick={() => {
//                     if (isMe) removeReaction();
//                   }}
//                   className={`flex items-center justify-between py-2 border-b px-2 rounded
//                   ${isMe ? "cursor-pointer hover:bg-gray-100" : ""}`}
//                 >

//                   <div className="flex items-center gap-3">

//                     <img
//                       src={`http://localhost:8080/api/users/image/get/user/${user.userId}`}
//                       className="w-8 h-8 rounded-full object-cover"
//                       alt="user"
//                     />

//                     <div>
//                       <p className="text-sm font-medium">
//                         {isMe ? "You" : user.userName}
//                       </p>

//                       {isMe && (
//                         <p className="text-xs text-green-500">
//                           Click to remove
//                         </p>
//                       )}
//                     </div>

//                   </div>

//                   <span className="text-xl">
//                     {user.emoji}
//                   </span>

//                 </div>
//               );

//             })}

//           </div>

//         )}

//         {/* CLOSE */}
//         <button
//           onClick={close}
//           className="mt-4 w-full bg-gray-200 py-2 rounded"
//         >
//           Close
//         </button>

//       </div>

//     </div>
//   );
// }

// export default ReactionModal;