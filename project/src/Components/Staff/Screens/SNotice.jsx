import React, { useEffect, useState } from "react";
import api from "../../../api/axios"; // Make sure this points to your axios instance
import { Trash2, Shield } from "lucide-react";

export default function SNotice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const SOCIETY_ID = localStorage.getItem("societyId"); // 29 in your example
  const STAFF_ID = localStorage.getItem("userId");      // 6 in your example

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/notices/society/${SOCIETY_ID}/staff/${STAFF_ID}`);
        setNotices(res.data || []);
      } catch (err) {
        console.error("Error fetching notices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [SOCIETY_ID, STAFF_ID]);

  // Badge helper
  const badge = (text, color) => (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${color}`}>
      {text}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 mt-14">
      <h2 className="text-2xl font-bold mb-4">Notices for Staff</h2>

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
    </div>
  );
}
