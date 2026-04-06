// import { useState, useEffect } from "react";
// import api from "../../../../api/axios";

// export const useChat = (SOCIETY_ID, USER_ID, USER_NAME, USER_ROLE, USER_TYPE) => {

//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [editingMessageId, setEditingMessageId] = useState(null);
//   const [editingText, setEditingText] = useState("");

//   const fetchMessages = async () => {
//     try {
//       const res = await api.get(`/society-chat/society/${SOCIETY_ID}/${USER_ID}`);

//       const formatted = res.data.map((msg) => {
//         const dateObj = new Date(msg.createdAt);

//         return {
//           id: msg.id,
//           sender: msg.senderName,
//           senderId: msg.senderId,
//           role: msg.role,
//           userType: msg.userType || "Member",
//           text: msg.message,
//           date: dateObj,
//           time: dateObj.toLocaleTimeString("en-IN", {
//             hour: "2-digit",
//             minute: "2-digit"
//           }),
//           seen: msg.seen || false,
//           me: msg.senderId == USER_ID,
//           reactions: msg.reactions || {}
//         };
//       });

//       formatted.sort((a, b) => a.date - b.date);
//       setMessages(formatted);

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     await api.post("/society-chat/send", {
//       societyId: SOCIETY_ID,
//       senderId: USER_ID,
//       senderName: USER_NAME,
//       role: USER_ROLE,
//       userType: USER_TYPE,
//       message
//     });

//     setMessage("");
//     fetchMessages();
//   };

//   const updateMessage = async () => {
//     if (!editingText.trim()) return;

//     await api.put(
//       `/society-chat/society/${SOCIETY_ID}/update/${editingMessageId}`,
//       {
//         senderId: USER_ID,
//         message: editingText
//       }
//     );

//     setEditingMessageId(null);
//     setEditingText("");
//     fetchMessages();
//   };

//   useEffect(() => {
//     fetchMessages();
//   }, []);

//   return {
//     messages,
//     message,
//     setMessage,
//     sendMessage,
//     fetchMessages,
//     editingMessageId,
//     setEditingMessageId,
//     editingText,
//     setEditingText,
//     updateMessage
//   };
// };