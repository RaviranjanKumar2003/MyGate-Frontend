import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MoreVertical, X } from "lucide-react";

function AllSocieties({ onViewDetails }) {
  const [societies, setSocieties] = useState([]);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editSociety, setEditSociety] = useState(null);

  // ✅ multiple refs for menus
  const menuRefs = useRef({});

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  /* ================= FETCH ================= */
  const fetchSocieties = async () => {
    try {
      const url =
        activeTab === "ACTIVE"
          ? `${BASE_URL}/societies`
          : `${BASE_URL}/societies/inactive`;

      const res = await axios.get(url);
      setSocieties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, [activeTab]);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideAnyMenu = Object.values(menuRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );

      if (!isInsideAnyMenu) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this society?")) return;
    await axios.delete(`${BASE_URL}/societies/${id}`);
    fetchSocieties();
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      await axios.put(
        `${BASE_URL}/societies/${editSociety.id}`,
        editSociety
      );
      setEditSociety(null);
      fetchSocieties();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-linear-to-br from-indigo-50 via-white to-purple-50 min-h-screen mt-8">

      {/* HEADER */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
        🏢 All Societies
      </h1>

      {/* TABS */}
      <div className="flex gap-2 md:gap-4 mb-6 flex-wrap">
        {["ACTIVE", "INACTIVE"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold transition 
            ${
              activeTab === tab
                ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "bg-white border hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {societies.map((s) => (
          <div
            key={s.id}
            className="relative bg-white/80 backdrop-blur p-4 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            {/* MENU BUTTON */}
            <button
              className="absolute top-3 right-3"
              onClick={() =>
                setOpenMenuId(openMenuId === s.id ? null : s.id)
              }
            >
              <MoreVertical size={18} />
            </button>

            {/* MENU */}
            {openMenuId === s.id && (
              <div
                ref={(el) => (menuRefs.current[s.id] = el)}
                className="absolute right-3 top-10 bg-white shadow-lg rounded-lg w-32 z-10 overflow-hidden animate-fadeIn"
              >
                <button
                  className="w-full px-4 py-2 hover:bg-indigo-50 text-left"
                  onClick={() => {
                    setEditSociety(s);
                    setOpenMenuId(null);
                  }}
                >
                  ✏️ Update
                </button>

                <button
                  className="w-full px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                  onClick={() => handleDelete(s.id)}
                >
                  🗑 Delete
                </button>
              </div>
            )}

            {/* CONTENT */}
            <h2 className="font-bold text-lg text-indigo-600">
              🏢 {s.name}
            </h2>

            <p className="text-sm text-gray-500">
              👤 {s.societyAdmin?.adminName}
            </p>

            <p className="text-sm text-gray-600">📍 {s.city}</p>

            <p className="text-sm text-gray-400 line-clamp-2">
              {s.address}
            </p>

            {/* BUTTON */}
            <button
              onClick={() => onViewDetails(s)}
              className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg hover:scale-105 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {editSociety && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-5 rounded-2xl w-full max-w-md relative shadow-xl">

            <button
              className="absolute top-3 right-3"
              onClick={() => setEditSociety(null)}
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-indigo-600">
              Update Society
            </h2>

            <input
              className="w-full border p-2 mb-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Society Name"
              value={editSociety.name}
              onChange={(e) =>
                setEditSociety({ ...editSociety, name: e.target.value })
              }
            />

            <input
              className="w-full border p-2 mb-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="City"
              value={editSociety.city}
              onChange={(e) =>
                setEditSociety({ ...editSociety, city: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 mb-4 rounded focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Address"
              value={editSociety.address}
              onChange={(e) =>
                setEditSociety({ ...editSociety, address: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditSociety(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllSocieties;