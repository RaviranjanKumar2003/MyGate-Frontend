import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const EDIT_WINDOW_MS = 2 * 60 * 1000;

function SuperAdminNotice() {
  const superAdminId = 1;

  const [mode, setMode] = useState("VIEW"); // VIEW | CREATE | EDIT
  const [notices, setNotices] = useState([]);
  const [editingNoticeId, setEditingNoticeId] = useState(null);

  // 🔹 NEW: scope selection
  const [scope, setScope] = useState(""); // ALL | SOCIETY
  const [societies, setSocieties] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "HIGH",
    noticeType: "GENERAL",
    targetRole: "ALL",
    societyId: "",
  });

  /* ================= FETCH NOTICES ================= */
  const fetchNotices = async () => {
    try {
      const res = await api.get(`/notices/superAdminId/${superAdminId}`);
      setNotices(res.data || []);
    } catch (err) {
      console.error("FETCH NOTICE ERROR", err);
      alert("❌ Failed to fetch notices");
    }
  };

  useEffect(() => {
    if (mode === "VIEW") fetchNotices();
  }, [mode]);

  /* ================= FETCH SOCIETIES ================= */
  const fetchSocieties = async () => {
    try {
      const res = await api.get("/societies");
      setSocieties(res.data || []);
    } catch (err) {
      console.error("FETCH SOCIETIES ERROR", err);
      alert("❌ Failed to load societies");
    }
  };

  /* ================= CREATE NOTICE ================= */
  const createNotice = async (e) => {
    e.preventDefault();

    try {
      if (scope === "SOCIETY" && formData.societyId) {
        await api.post(
          `/notices/superAdminId/${superAdminId}/society/${formData.societyId}/create`,
          {
            title: formData.title,
            message: formData.message,
            noticeType: formData.noticeType,
            priority: formData.priority,
            targetRole: formData.targetRole,
          }
        );
      } else {
        await api.post(`/notices/superAdminId/${superAdminId}/create`, {
          title: formData.title,
          message: formData.message,
          noticeType: formData.noticeType,
          priority: formData.priority,
        });
      }

      alert("✅ Notice Created Successfully");
      resetForm();
      setScope("");
      setMode("VIEW");
    } catch (err) {
      console.error("CREATE NOTICE ERROR", err);
      alert("❌ Failed to create notice");
    }
  };

  /* ================= UPDATE NOTICE ================= */
  const updateNotice = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      fd.append(
        "dto",
        JSON.stringify({
          title: formData.title,
          message: formData.message,
          noticeType: formData.noticeType,
          priority: formData.priority,
          targetRole: formData.targetRole,
        })
      );

      const params = {
        userId: superAdminId,
        role: "SUPER_ADMIN",
      };

      if (formData.societyId) params.societyId = formData.societyId;

      await api.put(`/notices/${editingNoticeId}`, fd, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Notice Updated Successfully");
      resetForm();
      setEditingNoticeId(null);
      setMode("VIEW");
    } catch (err) {
      console.error("UPDATE NOTICE ERROR", err.response?.data || err);
      alert("❌ Update failed");
    }
  };

  /* ================= DELETE NOTICE ================= */
  const deleteNotice = async (id, societyId) => {
    if (!window.confirm("Delete this notice?")) return;

    try {
      await api.delete(
        `/notices/${id}?userId=${superAdminId}&role=SUPER_ADMIN&societyId=${societyId || 0}`
      );
      fetchNotices();
    } catch (err) {
      console.error("DELETE NOTICE ERROR", err);
      alert("❌ Failed to delete notice");
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (n) => {
    setEditingNoticeId(n.id);
    setFormData({
      title: n.title,
      message: n.message,
      priority: n.priority,
      noticeType: n.noticeType,
      targetRole: n.targetRole || "ALL",
      societyId: n.targetSocietyId || "",
    });
    setMode("EDIT");
  };

  const canEdit = (createdAt) =>
    // eslint-disable-next-line react-hooks/purity
    Date.now() - new Date(createdAt).getTime() <= EDIT_WINDOW_MS;

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      priority: "HIGH",
      noticeType: "GENERAL",
      targetRole: "ALL",
      societyId: "",
    });
  };

  return (
    <div className="p-6 mt-10 max-w-4xl mx-auto">
      {/* ===== TOP BUTTONS ===== */}
      {mode !== "EDIT" && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("CREATE")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            + Create Notice
          </button>
          <button
            onClick={() => setMode("VIEW")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            View Notices
          </button>
        </div>
      )}

      {/* ================= CREATE / EDIT ================= */}
      {(mode === "CREATE" || mode === "EDIT") && (
        <form
          onSubmit={mode === "EDIT" ? updateNotice : createNotice}
          className="bg-white p-6 rounded-xl shadow space-y-4"
        >
          <h3 className="font-bold text-lg">
            {mode === "EDIT" ? "Edit Notice" : "Create Notice"}
          </h3>

          {/* 🔹 ONLY IN CREATE MODE */}
          {mode === "CREATE" && (
            <>
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  if (e.target.value === "SOCIETY") fetchSocieties();
                }}
                required
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Target</option>
                <option value="ALL">All Societies</option>
                <option value="SOCIETY">Particular Society</option>
              </select>

              {scope === "SOCIETY" && (
                <select
                  value={formData.societyId}
                  onChange={(e) =>
                    setFormData({ ...formData, societyId: e.target.value })
                  }
                  required
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Society</option>
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <input
            type="text"
            placeholder="Title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <textarea
            placeholder="Message"
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          >
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            {mode === "EDIT" ? "Update Notice" : "Create Notice"}
          </button>
        </form>
      )}

      {/* ================= VIEW ================= */}
      {mode === "VIEW" && (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between"
            >
              <div>
                <h3 className="font-bold">{n.title}</h3>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                {canEdit(n.createdAt) && (
                  <button
                    onClick={() => startEdit(n)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteNotice(n.id, n.targetSocietyId)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuperAdminNotice;