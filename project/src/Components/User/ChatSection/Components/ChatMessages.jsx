// import React, { useState, useEffect, useRef } from "react";
// import {
//   ChevronDown,
//   Check,
//   CheckCheck,
//   Ban
// } from "lucide-react";

// function ChatMessages({
//   messages,
//   USER_ID,
//   formatDateLabel,
//   onDelete,
//   getProfileImage,
//   openReactionUsers,
//   setShowEmoji
// }) {

//   const [hoveredMsgId, setHoveredMsgId] = useState(null);
//   const chatEndRef = useRef(null); // for auto-scroll

//   // auto-scroll on messages update
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   let lastDate = "";

//   return (
//     <div className="flex-1 overflow-y-auto p-4 space-y-4">
//       {messages.map((msg) => {

//         const currentDate = new Date(msg.date).toDateString();
//         const showDate = currentDate !== lastDate;
//         lastDate = currentDate;

//         return (
//           <React.Fragment key={msg.id}>

//             {/* DATE LABEL */}
//             {showDate && (
//               <div className="flex justify-center">
//                 <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">
//                   {formatDateLabel(msg.date)}
//                 </span>
//               </div>
//             )}

//             {/* MESSAGE ROW */}
//             <div
//               className={`flex ${msg.me ? "justify-end" : "justify-start"}`}
//               onMouseEnter={() => setHoveredMsgId(msg.id)}
//               onMouseLeave={() => setHoveredMsgId(null)}
//             >

//               {/* PROFILE */}
//               {!msg.me && (
//                 <img
//                   src={getProfileImage(msg.senderId)}
//                   className="w-8 h-8 rounded-full mr-2"
//                   alt="user"
//                 />
//               )}

//               <div className="relative">

//                 {/* HOVER ACTIONS */}
//                 {hoveredMsgId === msg.id && (
//                   <div className={`absolute -top-2 flex gap-1 ${msg.me ? "-left-16" : "-right-16"}`}>
//                     {/* EMOJI */}
//                     <button
//                       className="bg-white shadow p-1 rounded-full"
//                       onClick={() => setShowEmoji(true)}
//                     >
//                       😀
//                     </button>

//                     {/* DELETE */}
//                     <button
//                       className="bg-white shadow p-1 rounded-full"
//                       onClick={() => onDelete(msg.id)}
//                     >
//                       <ChevronDown size={16} />
//                     </button>
//                   </div>
//                 )}

//                 {/* MESSAGE BOX */}
//                 <div
//                   className={`max-w-full px-4 py-2 rounded-xl shadow text-sm
//                     ${msg.me ? "bg-green-500 text-white" : "bg-white"}`}
//                 >

//                   {/* SENDER NAME */}
//                   {!msg.me && (
//                     <p className="text-xs font-semibold text-indigo-600">
//                       {msg.sender}
//                       <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
//                         {msg.userType}
//                       </span>
//                     </p>
//                   )}

//                   {/* MESSAGE CONTENT */}
//                   <div className="flex flex-col">

//                     {/* FILE */}
//                     {msg.text.startsWith("/uploads/") ? (
//                       <a
//                         href={`http://localhost:8080/api/files/download/${msg.text.split("/").pop()}`}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-blue-600 underline"
//                       >
//                         📎 Download File
//                       </a>

//                     ) : msg.text === "This message was deleted" ? (
//                       <div className="flex items-center text-[#f0e7e7] italic text-sm">
//                         <Ban size={16} />
//                         <span className="ml-1">This message was deleted</span>
//                       </div>

//                     ) : (
//                       <p>{msg.text}</p>
//                     )}

//                     {/* TIME + SEEN */}
//                     <div className="flex justify-end items-center gap-1 mt-1">
//                       <span className="text-[10px] opacity-70">{msg.time}</span>
//                       {msg.me && (
//                         msg.seen ? <CheckCheck size={14}/> : <Check size={14}/>
//                       )}
//                     </div>

//                   </div>

//                 </div>

//                 {/* REACTIONS */}
//                 {msg.reactions && Object.keys(msg.reactions).length > 0 && (
//                   <div className="flex gap-1 flex-wrap justify-end mt-1">
//                     {Object.entries(msg.reactions).map(([emoji, count]) => (
//                       <span
//                         key={emoji}
//                         onClick={() => openReactionUsers(msg.id)}
//                         className="bg-gray-200 text-xs px-2 py-0.5 rounded-full cursor-pointer"
//                       >
//                         {emoji} {count}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//               </div>

//             </div>

//           </React.Fragment>
//         );
//       })}

//       {/* AUTO-SCROLL TRIGGER */}
//       <div ref={chatEndRef} />

//     </div>
//   );
// }

// export default ChatMessages;