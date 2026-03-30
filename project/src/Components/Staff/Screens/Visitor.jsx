import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, User } from "lucide-react";

const SOCIETY_ID = localStorage.getItem("societyId") || 26;
const IMAGE_BASE_URL = "http://localhost:9090/api/visitors/image/get/visitor";

const TABS = ["WAITING", "INSIDE", "OUT", "REJECTED"];
const STATUS_MAP = {
  WAITING: ["PENDING"],
  INSIDE: ["IN"],
  OUT: ["OUT"],
  REJECTED: ["REJECTED"],
};

/* ================= VISITOR CARD ================= */
function VisitorCard({ visitor }) {
  const [imgError, setImgError] = useState(false);

  const getVisitTime = (v) => {
    if (v.visitorStatus === "PENDING" && v.createdAt) return { label: "Requested", time: v.createdAt };
    if (v.visitorStatus === "IN" && v.inTime) return { label: "In", time: v.inTime };
    if (v.visitorStatus === "OUT" && v.outTime) return { label: "Out", time: v.outTime };
    return null;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  const visitInfo = getVisitTime(visitor);

  return (
    <div className="rounded-2xl border bg-white shadow-sm hover:shadow-lg transition p-5">
      <div className="flex items-start gap-4">
        {/* 👤 IMAGE / ICON */}
        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {!imgError ? (
            <img
              src={`${IMAGE_BASE_URL}/${visitor.id}`}
              alt={visitor.name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <User
              size={20}
              className={
                visitor.visitorStatus === "PENDING"
                  ? "text-yellow-500"
                  : visitor.visitorStatus === "IN"
                  ? "text-blue-500"
                  : visitor.visitorStatus === "OUT"
                  ? "text-green-500"
                  : "text-red-500"
              }
            />
          )}
        </div>

        {/* DETAILS */}
        <div className="flex-1">
          {/* NAME + STATUS + TIME */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-800">{visitor.name || "Unknown"}</h3>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium
                ${
                  visitor.visitorStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : visitor.visitorStatus === "IN"
                    ? "bg-blue-100 text-blue-700"
                    : visitor.visitorStatus === "OUT"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {visitor.visitorStatus}
            </span>

            {/* ⏱ TIME */}
            {visitInfo && (
              <span className="text-xs text-gray-500">
                {visitInfo.label}: {formatDateTime(visitInfo.time)}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1">📞 {visitor.mobileNumber || "-"}</p>

          <div className="mt-3 text-sm text-gray-600 grid grid-cols-3 gap-2">
            <p>🏢 {visitor.buildingName || "-"}</p>
            <p>🪜 {visitor.floorNumber || "-"}</p>
            <p>🚪 {visitor.flatNumber || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN VISITOR COMPONENT ================= */
export default function Visitor() {
  const [activeTab, setActiveTab] = useState("WAITING");
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await axios.get(`http://localhost:9090/api/visitors/society/${SOCIETY_ID}`);
      setVisitors(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Fetch visitors failed", err);
    }
  };

  /* ================= FILTER VISITORS ================= */
  const filteredVisitors = visitors.filter((v) => {
    const keyword = search.toLowerCase();
    return (
      STATUS_MAP[activeTab].includes(v.visitorStatus) &&
      (!keyword ||
        v.name?.toLowerCase().includes(keyword) ||
        v.mobileNumber?.includes(keyword) ||
        v.flatNumber?.toString().includes(keyword))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEARCH */}
      <div className="pt-6 px-4 lg:mt-14">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
            <Search className="text-gray-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile, flat..."
              className="flex-1 outline-none px-3"
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-6 px-4">
        <div className="max-w-4xl mx-auto flex border-b ">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-semibold transition text-sm lg:text-lg
                ${
                  activeTab === tab
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500"
                }`}
            >
              {tab} (
              {visitors.filter((v) => STATUS_MAP[tab].includes(v.visitorStatus)).length})
            </button>
          ))}
        </div>
      </div>

      {/* VISITOR LIST */}
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVisitors.length ? (
            filteredVisitors.map((v) => <VisitorCard key={v.id} visitor={v} />)
          ) : (
            <p className="text-gray-500 col-span-full text-center">No visitors found</p>
          )}
        </div>
      </div>
    </div>
  );
}
