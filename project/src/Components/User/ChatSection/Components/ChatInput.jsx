// import React, { useState, useRef, useEffect } from "react";
// import { Send, Smile, Paperclip, X, Mic } from "lucide-react";

// function ChatInput({
//   message,
//   setMessage,
//   sendMessage,
//   editingMessageId,
//   editingText,
//   setEditingText,
//   updateMessage,
//   openDocs,
//   selectedFile,
//   setSelectedFile,
//   uploadFile
// }) {

//   const [showEmoji, setShowEmoji] = useState(false);
//   const fileInputRef = useRef(null);
//   const emojiRef = useRef(null);

//   const emojis = ["😀", "😂", "😍", "👍", "🔥", "🎉", "😢", "😎"];

//   /* ================= OUTSIDE CLICK CLOSE ================= */
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (emojiRef.current && !emojiRef.current.contains(e.target)) {
//         setShowEmoji(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   /* ================= SEND ================= */
//   const handleSend = () => {
//     if (!message.trim() && !selectedFile) return;

//     if (selectedFile) {
//       uploadFile(selectedFile);
//       setSelectedFile(null);
//       return;
//     }

//     sendMessage();
//   };

//   /* ================= UPDATE ================= */
//   const handleUpdate = () => {
//     if (!editingText.trim()) return;
//     updateMessage();
//   };

//   /* ================= FILE ================= */
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   /* ================= EMOJI ================= */
//   const addEmoji = (emoji) => {
//     if (editingMessageId) {
//       setEditingText(editingText + emoji);
//     } else {
//       setMessage(message + emoji);
//     }
//   };

//   const isTyping = editingMessageId
//     ? editingText.trim().length > 0
//     : message.trim().length > 0 || selectedFile;

//   return (
//     <div className="bg-white border-t p-3 relative">

//       {/* FILE PREVIEW */}
//       {selectedFile && (
//         <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
//           <span className="text-sm truncate">{selectedFile.name}</span>
//           <button onClick={() => setSelectedFile(null)}>
//             <X size={18} />
//           </button>
//         </div>
//       )}

//       {/* EDIT MODE */}
//       {editingMessageId && (
//         <div className="flex items-center mb-2 text-sm text-blue-600">
//           Editing message...
//         </div>
//       )}

//       <div className="flex items-center gap-2 relative">

//         {/* EMOJI BUTTON */}
//         <button onClick={() => setShowEmoji(!showEmoji)}>
//           <Smile size={22} />
//         </button>

//         {/* EMOJI PICKER */}
//         {showEmoji && (
//           <div
//             ref={emojiRef}
//             className="absolute bottom-14 left-0 bg-white border rounded-xl shadow-lg p-2 flex gap-2 z-50"
//           >
//             {emojis.map((e, i) => (
//               <span
//                 key={i}
//                 className="cursor-pointer text-xl hover:scale-125 transition"
//                 onClick={() => addEmoji(e)}
//               >
//                 {e}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* DOCUMENT BUTTON */}
//         <button onClick={openDocs}>
//           <Paperclip size={22} />
//         </button>

//         {/* FILE INPUT (hidden) */}
//         <input
//           type="file"
//           ref={fileInputRef}
//           hidden
//           onChange={handleFileChange}
//         />

//         {/* INPUT */}
//         <input
//           type="text"
//           placeholder="Type a message..."
//           value={editingMessageId ? editingText : message}
//           onChange={(e) =>
//             editingMessageId
//               ? setEditingText(e.target.value)
//               : setMessage(e.target.value)
//           }
//           className="flex-1 border rounded-full px-4 py-2 outline-none"
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               editingMessageId ? handleUpdate() : handleSend();
//             }
//           }}
//         />

//         {/* MIC / SEND */}
//         {isTyping ? (
//           <button
//             onClick={editingMessageId ? handleUpdate : handleSend}
//             className="bg-blue-500 text-white p-2 rounded-full"
//           >
//             <Send size={18} />
//           </button>
//         ) : (
//           <button className="bg-gray-200 p-2 rounded-full">
//             <Mic size={18} />
//           </button>
//         )}

//       </div>
//     </div>
//   );
// }

// export default ChatInput;