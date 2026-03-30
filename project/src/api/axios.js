import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
// const api = axios.create({
//   baseURL: "http://localhost:9090/api",
// });

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});


/* ================= JWT INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ==================================================
   NOTICE APIs
   ================================================== */

/* 🔔 Society Admin – VIEW notices (global + society) */
export const getSocietyAdminNotices = (societyId, adminId) => {
  return api.get(`/notices/society/${societyId}`, {
    params: {
      adminId,
    },
  });
};


/* 📝 Super Admin – VIEW all notices */
export const getSuperAdminNotices = (superAdminId) => {
  return api.get(`/notices/superAdminId/${superAdminId}`);
};

/* 📝 Super Admin – CREATE notice
   ✔ Global notice
   ✔ Society specific notice
*/
export const createSuperAdminNotice = (
  superAdminId,
  dto,
  societyId = null
) => {
  const url = societyId
    ? `/notices/superAdminId/${superAdminId}/society/${societyId}/create`
    : `/notices/superAdminId/${superAdminId}/create`;

  return api.post(url, {
    title: dto.title,
    message: dto.message,
    noticeType: dto.noticeType,
    priority: dto.priority,
    targetRole: dto.targetRole ?? "ALL",
  });
};

/* 🗑 Super Admin – DELETE notice
   ✔ Global / Society notice
*/
export const deleteSuperAdminNotice = (
  noticeId,
  superAdminId,
  societyId = null
) => {
  return api.delete(`/notices/${noticeId}`, {
    params: {
      userId: superAdminId,
      role: "SUPER_ADMIN",
      societyId,
    },
  });
};

/* ==================================================
   EXPORT AXIOS INSTANCE
   ================================================== */
export default api;
