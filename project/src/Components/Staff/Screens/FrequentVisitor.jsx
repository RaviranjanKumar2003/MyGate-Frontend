import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "lucide-react";

const SOCIETY_ID = localStorage.getItem("societyId");
const IMAGE_BASE_URL =
  "http://localhost:9090/api/visitors/image/get/visitor";

export default function FrequentVisitor() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFrequentVisitors();
  }, []);

  const fetchFrequentVisitors = async () => {
    if (!SOCIETY_ID) return;

    try {
      const res = await axios.get(
        `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/visitorType/FREQUENT`
      );

      setVisitors(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const renderVisitor = (visitor) => (
    <div
      key={visitor.id}
      className="rounded-2xl border bg-white shadow-sm hover:shadow-lg transition p-5"
    >
      <div className="flex items-start gap-4">
        {/* 👤 IMAGE */}
        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={`${IMAGE_BASE_URL}/${visitor.id}`}
            alt={visitor.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
          <User
            size={20}
            className={
              visitor.status === "IN"
                ? "text-green-500"
                : "text-yellow-500"
            }
          />
        </div>

        {/* DETAILS */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">
              {visitor.name || "Unknown"}
            </h3>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ml-16
                ${
                  visitor.status === "IN"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {visitor.visitorStatus}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            📞 {visitor.mobileNumber || "-"}
          </p>

          <div className="mt-4 text-sm text-gray-600 grid grid-cols-3 gap-2">
            <p>🏢 {visitor.buildingName || "-"}</p>
            <p>🪜 {visitor.floorNumber || "-"}</p>
            <p>🚪 {visitor.flatNumber || "-"}</p>
          </div>

          {visitor.lastVisit && (
            <p className="text-xs text-gray-400 mt-2">
              Last Visit: {new Date(visitor.lastVisit).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 mt-4 px-4 lg:mt-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Frequent Visitors</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : visitors.length === 0 ? (
          <p className="text-center text-gray-500">
            No frequent visitors found
          </p>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visitors.map(renderVisitor)}
          </div>
        )}
      </div>
    </div>
  );
}
