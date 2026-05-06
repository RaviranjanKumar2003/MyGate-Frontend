import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function FlatApprovals() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const societyId = localStorage.getItem("societyId");

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/flat-listings/society/${societyId}`);
      setListings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/flat-listings/${id}/status?status=${status}`);
      fetchListings();
    } catch {
      alert("Failed");
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings =
    filter === "ALL"
      ? listings
      : listings.filter((l) => l.status === filter);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Flat Approvals 🏠
        </h2>
        <p className="text-gray-500 text-sm">
          Manage and approve flat listings
        </p>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["ALL", "PENDING", "ACTIVE", "REJECTED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filter === f
                ? "bg-indigo-600 text-white shadow"
                : "bg-white border hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* EMPTY */}
      {!loading && filteredListings.length === 0 && (
        <p className="text-gray-400">No listings found</p>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map((l) => (
          <div
            key={l.id}
            className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition border hover:-translate-y-1"
          >
            {/* TOP */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                {l.type}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  l.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : l.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {l.status}
              </span>
            </div>

            {/* FLAT */}
            <h3 className="text-lg font-semibold text-gray-800">
              🏢 {l.flatNumber || `Flat #${l.flatId}`}
            </h3>

            {/* OWNER */}
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>👤 {l.ownerName || "Unknown"}</p>
              <p>📞 {l.ownerMobile || "N/A"}</p>
            </div>

            {/* PRICE */}
            <div className="mt-3">
              {l.type === "SELL" ? (
                <p className="text-green-600 font-bold text-xl">
                  ₹{l.price}
                </p>
              ) : (
                <p className="text-blue-600 font-bold text-xl">
                  ₹{l.rent}/mo
                </p>
              )}
            </div>

            {/* ACTION */}
            {l.status === "PENDING" && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => updateStatus(l.id, "ACTIVE")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(l.id, "REJECTED")}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                >
                  Reject
                </button>
              </div>
            )}

            {/* CALL BUTTON */}
            {l.ownerMobile && (
              <a
                href={`tel:${l.ownerMobile}`}
                className="block text-center mt-3 text-sm text-indigo-600 font-medium hover:underline"
              >
                📞 Call Owner
              </a>
            )}

            {/* STATUS TEXT */}
            {l.status === "ACTIVE" && (
              <p className="text-green-600 mt-3 font-semibold text-sm">
                ✔ Approved
              </p>
            )}
            {l.status === "REJECTED" && (
              <p className="text-red-500 mt-3 font-semibold text-sm">
                ✖ Rejected
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlatApprovals;