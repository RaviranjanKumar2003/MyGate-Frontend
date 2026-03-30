import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import moment from "moment";

/* ================= LOCAL STORAGE HELPERS ================= */
const HIDDEN_KEY = "superadmin_hidden_complaints";

const getHiddenIds = () => {
  return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
};

const addHiddenId = (id) => {
  const prev = getHiddenIds();
  if (!prev.includes(id)) {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify([...prev, id]));
  }
};

function SuperComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= FETCH ALL COMPLAINTS ================= */
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/complaints");

      const hiddenIds = getHiddenIds();

      // 🔥 filter hidden complaints
      setComplaints(
        (res.data || []).filter((c) => !hiddenIds.includes(c.id))
      );
    } catch (error) {
      console.error("Error fetching complaints", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const statusStyle = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-green-100 text-green-700",
  };

  /* ================= MARK AS RESOLVED ================= */
  const markAsResolved = async (complaintId) => {
    try {
      setUpdatingId(complaintId);

      await api.put(
        `/complaints/${complaintId}/status`,
        null,
        { params: { status: "RESOLVED" } }
      );

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, status: "RESOLVED" } : c
        )
      );
    } catch (error) {
      console.error("Error updating complaint status", error);
      alert("Failed to update complaint status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= PERSISTENT UI DELETE ================= */
  const handleUiDelete = (complaintId) => {
    if (!window.confirm("Remove this complaint from dashboard?")) return;

    addHiddenId(complaintId); // ✅ persist hide

    setComplaints((prev) =>
      prev.filter((c) => c.id !== complaintId)
    );
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="mt-12 text-center text-gray-500 text-lg">
        Loading complaints...
      </div>
    );
  }

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Society Admin Complaints
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Complaints raised by Society Admins across societies
        </p>
      </div>

      {/* EMPTY STATE */}
      {complaints.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No complaints found
        </div>
      ) : (
        <div className="space-y-5">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-5"
            >
              {/* TOP ROW */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {complaint.title}
                </h3>
                <span
                  className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full w-fit ${
                    statusStyle[complaint.status] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-gray-600 mt-3 text-sm sm:text-base">
                {complaint.description}
              </p>

              {/* INFO GRID */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-500 font-medium">
                    Society Name
                  </p>
                  <p className="font-semibold text-gray-800">
                    {complaint.societyName || "N/A"}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-500 font-medium">
                    Society Admin
                  </p>
                  <p className="font-semibold text-gray-800">
                    {complaint.createdByName || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">
                    Society ID
                  </p>
                  <p className="font-semibold text-gray-800">
                    {complaint.societyId || "N/A"}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-500 font-medium">
                    Created At
                  </p>
                  <p className="font-semibold text-gray-800">
                    {moment(complaint.createdAt).format(
                      "DD MMM YYYY, hh:mm A"
                    )}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 text-right">
                {complaint.status === "PENDING" && (
                  <button
                    onClick={() => markAsResolved(complaint.id)}
                    disabled={updatingId === complaint.id}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingId === complaint.id ? "Updating..." : "Done"}
                  </button>
                )}

                {complaint.status === "RESOLVED" && (
                  <button
                    onClick={() => handleUiDelete(complaint.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuperComplaint;