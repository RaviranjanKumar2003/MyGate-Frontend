import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Trash2, Shield } from "lucide-react";

export default function Notices() {
  const [tab, setTab] = useState("MY"); // MY | SUPER | CREATE
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const SOCIETY_ID = Number(localStorage.getItem("societyId"));
  const USER_ID = Number(localStorage.getItem("userId")); // ✅
  console.log(USER_ID, SOCIETY_ID);

  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "MEDIUM",
    targetRole: "ALL",
    noticeType: "GENERAL",
  });

  // ✅ Seen Feature
  const [seenUsers, setSeenUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [, setSelectedNoticeId] = useState(null);

  useEffect(() => {
  console.log("SEEN USERS UPDATED:", seenUsers);
}, [seenUsers]);

  // ================= MARK AS SEEN =================
  const markAsSeen = async (noticeId) => {
  try {
    console.log("MARK:", noticeId, USER_ID);

    await api.post(`/notice-seen/${noticeId}/seen`, null, {
      params: {
        userId: USER_ID,
        role: "SOCIETY_ADMIN",
      },
    });
  } catch (err) {
    console.log("Seen error FULL:", err.response?.data || err);
  }
};

  // ================= FETCH NOTICES =================
  useEffect(() => {
    if (tab === "CREATE") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let res;

        if (tab === "SUPER") {
          res = await api.get(
            `/notices/society/${SOCIETY_ID}/societyAdminId/${USER_ID}`
          );
        } else {
          res = await api.get(`/notices/societyAdminId/${USER_ID}`);
        }

        const data = res.data || [];

        const filtered =
          tab === "SUPER"
            ? data.filter((n) => n.createdByRole === "SUPER_ADMIN")
            : data.filter((n) => n.createdByRole === "SOCIETY_ADMIN");

        setNotices(filtered);
      } catch (err) {
        console.error("FETCH NOTICE ERROR", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab, SOCIETY_ID, USER_ID]);

  // ================= AUTO MARK AS SEEN =================
  useEffect(() => {
  if (tab !== "CREATE" && notices.length > 0) {
    notices.forEach((n) => {
      // ❌ skip if I am creator
      if (n.createdById !== USER_ID) {
        markAsSeen(n.id);
      }
    });
  }
}, [notices]);
  // ================= CREATE NOTICE =================
  const createNotice = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        `/notices/society/${SOCIETY_ID}/societyAdminId/${USER_ID}/create`,
        {
          title: form.title.trim(),
          message: form.message.trim(),
          noticeType: form.noticeType.trim().toUpperCase(),
          priority: form.priority.trim().toUpperCase(),
          targetRole: form.targetRole.trim().toUpperCase(),
        }
      );

      alert("✅ Notice created successfully");

      setForm({
        title: "",
        message: "",
        priority: "MEDIUM",
        targetRole: "ALL",
        noticeType: "GENERAL",
      });

      setTab("MY");
    } catch (err) {
      console.error("CREATE NOTICE ERROR", err);
      alert("❌ Failed to create notice");
    }
  };

  // ================= DELETE NOTICE =================
  const deleteNotice = async (id) => {
    if (!window.confirm("Delete this notice permanently?")) return;

    try {
      await api.delete(
        `/notices/${id}?userId=${USER_ID}&role=SOCIETY_ADMIN&societyId=${SOCIETY_ID}`
      );
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("DELETE NOTICE ERROR", err);
      alert("❌ Failed to delete notice");
    }
  };

  // ================= FETCH SEEN USERS =================
  const fetchSeenUsers = async (noticeId) => {
  try {
    const res = await api.get(`/notice-seen/${noticeId}/seen-users`); // ✅ FIX
    setSeenUsers(res.data);
    setSelectedNoticeId(noticeId);
    setShowModal(true);
  } catch (err) {
    console.log("Seen users error", err);
  }
};

  // ================= BADGE =================
  const badge = (text, color) => (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${color}`}>
      {text}
    </span>
  );

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* ===== Tabs ===== */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "MY", label: "My Notices" },
          { key: "SUPER", label: "Super Admin Notices" },
          { key: "CREATE", label: "Create Notice" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              tab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= CREATE FORM ================= */}
      {tab === "CREATE" && (
        <form
          onSubmit={createNotice}
          className="bg-white p-6 rounded-xl shadow-md grid gap-4"
        >
          <h2 className="text-xl font-bold">Create Notice</h2>

          <input
            className="border p-2 rounded"
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="border p-2 rounded"
            placeholder="Message"
            rows={4}
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <div className="grid md:grid-cols-3 gap-3">
            <select
              className="border p-2 rounded"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value.toUpperCase().trim() })
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>

            <select
              className="border p-2 rounded"
              value={form.noticeType}
              onChange={(e) =>
                setForm({ ...form, noticeType: e.target.value.toUpperCase().trim() })
              }
            >
              <option value="GENERAL">GENERAL</option>
              <option value="IMPORTANT">IMPORTANT</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="SECURITY">SECURITY</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="EVENT">EVENT</option>
              <option value="EMERGENCY">EMERGENCY</option>
            </select>

            <select
              className="border p-2 rounded"
              value={form.targetRole}
              onChange={(e) =>
                setForm({ ...form, targetRole: e.target.value.toUpperCase().trim() })
              }
            >
              <option value="ALL">ALL</option>
              <option value="OWNER">OWNER</option>
              <option value="RESIDENT">RESIDENT</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>

          <button className="bg-green-600 text-white py-2 rounded-lg font-semibold cursor-pointer">
            Publish Notice
          </button>
        </form>
      )}

      {/* ================= NOTICES LIST ================= */}
      {tab !== "CREATE" && (
        <>
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : notices.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-6 rounded-xl shadow">
              🎉 No notices found
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {notices.map((n) => (
                <div key={n.id} className="bg-white p-5 rounded-xl shadow">

                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{n.createdByName}</h4>
                      <p className="text-xs text-gray-500">{n.createdByRole}</p>
                    </div>

                    {tab === "MY" && (
                      <button
                        onClick={() => deleteNotice(n.id)}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                    {tab === "SUPER" && (
                      <Shield size={18} className="text-indigo-500" />
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-1">{n.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{n.message}</p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {badge(n.priority, "bg-red-100 text-red-600")}
                    {badge(n.noticeType, "bg-blue-100 text-blue-600")}
                    {badge(n.targetRole, "bg-gray-100 text-gray-600")}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>

                  {tab === "MY" && (
                    <button
                      onClick={() => fetchSeenUsers(n.id)}
                      className="mt-3 text-indigo-600 text-sm font-semibold cursor-pointer"
                    >
                      👁 Notice Info
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-96 max-h-[80vh] overflow-y-auto p-5 rounded-xl shadow-lg">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">👁 Notice Info</h3>
              <button onClick={() => setShowModal(false)}>❌</button>
            </div>

            <div className="mb-3 text-sm">
              <p className="font-semibold text-green-600">
                Seen: {seenUsers.length}
              </p>
            </div>

           {seenUsers?.length === 0 ? (
  <p className="text-gray-500 text-sm text-center py-4">
    No one has seen this notice yet
  </p>
) : (
  <div className="space-y-3">
    {seenUsers.map((u, index) => (
      <div
        key={u.id || index}
        className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
      >

        {/* ===== TOP ROW ===== */}
        <div className="flex justify-between items-start">

          {/* NAME */}
          <div>
            <p className="font-semibold text-gray-800">
              {u.userName || `User ID: ${u.userId}`}
            </p>

            <p className="text-xs text-gray-500">
              Role: {u.userRole}
            </p>
          </div>

          {/* ROLE BADGE */}
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              u.userRole === "SOCIETY_ADMIN"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {u.userRole}
          </span>
        </div>

        {/* ===== SOCIETY ADMIN INFO ===== */}
        {u.societyName && (
          <div className="mt-2 text-xs text-blue-600">
            🏢 Society: <span className="font-medium">{u.societyName}</span>
          </div>
        )}

        {/* ===== NORMAL USER INFO ===== */}
        {u.userType && (
  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">

    <div>
      👤 Type:{" "}
      <span className="font-medium">{u.userType}</span>
    </div>

    <div>
      🏢 Building:{" "}
      <span className="font-medium">{u.building || "-"}</span>
    </div>

    <div>
      🏠 Floor:{" "}
      <span className="font-medium">{u.floor || "-"}</span>
    </div>

    <div>
      🚪 Flat:{" "}
      <span className="font-medium">{u.flat || "-"}</span>
    </div>

  </div>
)}

      </div>
    ))}
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}