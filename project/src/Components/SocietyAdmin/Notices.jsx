import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Trash2, Shield } from "lucide-react";

export default function Notices() {
  const [tab, setTab] = useState("MY"); // MY | SUPER | CREATE
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const SOCIETY_ID = localStorage.getItem("societyId");
  const USER_ID = localStorage.getItem("userId");

  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "MEDIUM",
    targetRole: "ALL",
    noticeType: "GENERAL",
  });

  // ================= FETCH NOTICES =================
  useEffect(() => {
    if (tab === "CREATE") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let res;

        if (tab === "SUPER") {
          // Super Admin Notices (filter by role)
          res = await api.get(
            `/notices/society/${SOCIETY_ID}/societyAdminId/${USER_ID}`
          );
        } else {
          // My Notices (Society Admin)
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

      // Reset form
      setForm({
        title: "",
        message: "",
        priority: "MEDIUM",
        targetRole: "ALL",
        noticeType: "GENERAL",
      });

      setTab("MY"); // switch to My Notices
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
                <div
                  key={n.id}
                  className="bg-white p-5 rounded-xl shadow"
                >
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
