// import api from "../../../../api/axios";

// /* ================= GET MESSAGES ================= */
// export const getMessages = async (societyId) => {
//   try {
//     const res = await api.get(`/society-chat/society/${societyId}`);
//     return res.data;
//   } catch (error) {
//     console.error("Fetch messages error:", error);
//     throw error;
//   }
// };

// /* ================= SEND MESSAGE ================= */
// export const sendMessageService = async ({
//   societyId,
//   senderId,
//   message
// }) => {
//   try {
//     const res = await api.post(
//       `/society-chat/society/${societyId}/send`,
//       {
//         senderId,
//         message
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Send message error:", error);
//     throw error;
//   }
// };

// /* ================= UPDATE MESSAGE ================= */
// export const updateMessageService = async ({
//   societyId,
//   messageId,
//   senderId,
//   message
// }) => {
//   try {
//     const res = await api.put(
//       `/society-chat/society/${societyId}/update/${messageId}`,
//       {
//         senderId,
//         message
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Update message error:", error);
//     throw error;
//   }
// };

// /* ================= DELETE FOR EVERYONE ================= */
// export const deleteForEveryoneService = async ({
//   societyId,
//   messageId,
//   senderId
// }) => {
//   try {
//     const res = await api.delete(
//       `/society-chat/society/${societyId}/hard-delete/${messageId}`,
//       {
//         data: { senderId }
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Delete for everyone error:", error);
//     throw error;
//   }
// };

// /* ================= DELETE FOR ME ================= */
// export const deleteForMeService = async ({
//   societyId,
//   messageId,
//   senderId
// }) => {
//   try {
//     const res = await api.put(
//       `/society-chat/society/${societyId}/soft-delete/${messageId}`,
//       {
//         senderId
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Delete for me error:", error);
//     throw error;
//   }
// };

// /* ================= FILE UPLOAD ================= */
// export const uploadFileService = async ({
//   societyId,
//   senderId,
//   file
// }) => {
//   try {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("senderId", senderId);

//     const res = await api.post(
//       `/society-chat/society/${societyId}/upload`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data"
//         }
//       }
//     );

//     return res.data;
//   } catch (error) {
//     console.error("File upload error:", error);
//     throw error;
//   }
// };