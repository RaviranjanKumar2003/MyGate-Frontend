// import api from "../../../../api/axios";

// /* ================= TOGGLE REACTION ================= */
// // add / remove same emoji
// export const toggleReaction = async ({ messageId, userId, emoji }) => {
//   try {
//     const res = await api.post("/reactions/toggle", {
//       messageId,
//       userId,
//       emoji
//     });
//     return res.data;
//   } catch (error) {
//     console.error("Toggle reaction error:", error);
//     throw error;
//   }
// };

// /* ================= GET REACTIONS ================= */
// export const getReactions = async (messageId) => {
//   try {
//     const res = await api.get(`/reactions/${messageId}`);
//     return res.data;
//   } catch (error) {
//     console.error("Get reactions error:", error);
//     throw error;
//   }
// };