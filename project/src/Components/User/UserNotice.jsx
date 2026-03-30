import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function UserNotice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SOCIETY_ID = localStorage.getItem("societyId");

  /* ================= FETCH NOTICES ================= */
  useEffect(() => {
    if (!SOCIETY_ID) {
      setError("Society not found");
      setLoading(false);
      return;
    }

    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/notices/normal-user?societyId=${SOCIETY_ID}`
        );

        const data = res.data || [];

        // ❌ Remove expired notices
        const validNotices = data.filter((n) => {
          if (!n.expiryDate) return true;
          return new Date(n.expiryDate) >= new Date();
        });

        setNotices(validNotices);
      } catch (err) {
        console.error("Notice fetch failed", err);
        setError("Failed to load notices. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [SOCIETY_ID]);

  /* ================= BADGES ================= */
  const priorityBadge = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading notices...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        📢 Society Notices
      </h2>

      {notices.length > 0 ? (
        notices.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition"
          >
            {/* ===== HEADER ===== */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {n.title}
              </h3>

              <div className="flex gap-2 flex-wrap">
                {/* Creator */}
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    n.createdByRole === "SUPER_ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {n.createdByRole === "SUPER_ADMIN"
                    ? "Super Admin"
                    : "Society Admin"}
                </span>

                {/* Priority */}
                {n.priority && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${priorityBadge(
                      n.priority
                    )}`}
                  >
                    {n.priority}
                  </span>
                )}
              </div>
            </div>

            {/* ===== MESSAGE ===== */}
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {n.message}
            </p>

            {/* ===== ATTACHMENT ===== */}
            {n.attachmentUrl && (
              <a
                href={n.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
              >
                📎 View Attachment
              </a>
            )}

            {/* ===== FOOTER ===== */}
            <div className="mt-3 text-xs text-gray-400 flex justify-between flex-wrap gap-2">
              <span>
                Posted on{" "}
                {new Date(n.createdAt).toLocaleString()}
              </span>

              {n.expiryDate && (
                <span>
                  Expires on{" "}
                  {new Date(n.expiryDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 mt-10 bg-white p-6 rounded-xl shadow">
          🎉 No notices available
        </div>
      )}
    </div>
  );
}

export default UserNotice;