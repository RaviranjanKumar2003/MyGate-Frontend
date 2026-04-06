// // useReaction.js
// import { useState } from "react";
// import api from "../api/axios"; // aapke project me correct path use kare

// export default function useReaction({ userId, refreshMessages }) {
//   const [reactingMsgId, setReactingMsgId] = useState(null);

//   /**
//    * Send or toggle reaction for a message
//    * @param {string} messageId
//    * @param {string} emoji
//    */
//   const reactToMessage = async (messageId, emoji) => {
//     if (!messageId) return;

//     setReactingMsgId(messageId);

//     try {
//       await api.post("/reactions/react", {
//         messageId,
//         userId,
//         emoji,
//       });

//       // Refresh messages after reaction update
//       refreshMessages && refreshMessages();
//     } catch (err) {
//       console.error("Reaction error:", err);
//     } finally {
//       setReactingMsgId(null);
//     }
//   };

//   /**
//    * Check if user already reacted with this emoji
//    * @param {object} reactions - { emoji: count }
//    */
//   const hasReacted = (reactions, emoji) => {
//     if (!reactions) return false;
//     return reactions[emoji]?.users?.includes(userId);
//   };

//   return {
//     reactingMsgId,
//     reactToMessage,
//     hasReacted,
//   };
// }