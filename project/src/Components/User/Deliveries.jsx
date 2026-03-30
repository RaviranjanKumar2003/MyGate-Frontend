import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Phone, Search } from "lucide-react";

const SOCIETY_ID = localStorage.getItem("societyId");
const BUILDING_ID = localStorage.getItem("buildingId");
const FLOOR_ID = localStorage.getItem("floorId");
const FLAT_ID = localStorage.getItem("flatId");

const IMAGE_BASE_URL =
  "http://localhost:9090/api/visitors/image/get/visitor";

/* ================= STATUS TABS ================= */
const STATUS_TABS = ["PENDING", "IN", "OUT", "REJECTED"];

export default function UserDelivery() {
  const [status, setStatus] = useState("PENDING");
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/building/${BUILDING_ID}/floor/${FLOOR_ID}/flat/${FLAT_ID}/status/${status}`
      );
      setVisitors(res.data || []);
    } catch {
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [status]);

  /* ================= UPDATE ================= */
  const updateVisitorStatus = async (visitorId, newStatus) => {
    try {
      setActionLoading(visitorId);
      await axios.put(
        `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/visitor/${visitorId}/status`,
        { visitorStatus: newStatus }
      );
      fetchVisitors();
    } catch {
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= FILTER ================= */
  const filteredVisitors = visitors
    .filter(v => v.visitorPurpose === "DELIVERY")
    .filter(v => {
      const key = search.toLowerCase();
      return (
        !key ||
        v.name?.toLowerCase().includes(key) ||
        v.mobileNumber?.includes(key) ||
        v.companyName?.toLowerCase().includes(key)
      );
    });

  const formatTime = (t) => {
    if (!t) return "-";
    const d = new Date(t);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 px-3 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-indigo-700">
          Deliveries
        </h2>
        <p className="text-xs text-gray-500">
          Track and manage your deliveries
        </p>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company or mobile..."
            className="flex-1 px-2 text-sm outline-none"
          />
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 whitespace-nowrap rounded-full text-xs font-semibold transition
              ${
                status === s
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-600 border"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-center text-gray-500 text-sm">
          Loading deliveries...
        </p>
      ) : filteredVisitors.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          No deliveries found
        </p>
      ) : (
        <div className="space-y-4">
          {filteredVisitors.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl shadow p-4">
              {/* TOP ROW */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={`${IMAGE_BASE_URL}/${v.id}`}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <User size={18} className="text-indigo-500" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {v.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Company: {v.companyName || "-"}
                  </p>

                  <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Phone size={12} />
                    {v.mobileNumber}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold
                    ${
                      v.visitorStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : v.visitorStatus === "IN"
                        ? "bg-green-100 text-green-700"
                        : v.visitorStatus === "OUT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {v.visitorStatus}
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p>Purpose: {v.visitorPurpose}</p>
                <p>Flat: {v.flatNumber}</p>
                <p>
                  {v.visitorStatus === "PENDING" &&
                    `Requested: ${formatTime(v.createdAt)}`}
                  {v.visitorStatus === "IN" &&
                    `In: ${formatTime(v.inTime)}`}
                  {v.visitorStatus === "OUT" &&
                    `Delivered: ${formatTime(v.outTime)}`}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex justify-end gap-2">
                {v.visitorStatus === "PENDING" && (
                  <>
                    <button
                      disabled={actionLoading === v.id}
                      onClick={() => updateVisitorStatus(v.id, "IN")}
                      className="px-4 py-2 text-xs rounded-full bg-green-500 text-white"
                    >
                      Approve
                    </button>
                    <button
                      disabled={actionLoading === v.id}
                      onClick={() => updateVisitorStatus(v.id, "REJECTED")}
                      className="px-4 py-2 text-xs rounded-full bg-red-500 text-white"
                    >
                      Reject
                    </button>
                  </>
                )}

                {v.visitorStatus === "IN" && (
                  <button
                    disabled={actionLoading === v.id}
                    onClick={() => updateVisitorStatus(v.id, "OUT")}
                    className="px-4 py-2 text-xs rounded-full bg-blue-500 text-white"
                  >
                    Mark Delivered
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
