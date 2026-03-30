import React, { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical, X } from "lucide-react";

function AllSocieties({ onViewDetails }) {
  const [societies, setSocieties] = useState([]);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [openMenuId, setOpenMenuId] = useState(null);

  const [editSociety, setEditSociety] = useState(null); // ✅ ADD

  /* ================= FETCH ================= */
  const fetchSocieties = async () => {
    const url =
      activeTab === "ACTIVE"
        ? "http://localhost:9090/api/societies"
        : "http://localhost:9090/api/societies/inactive";

    const res = await axios.get(url);
    setSocieties(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSocieties();
  }, [activeTab]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this society?")) return;
    await axios.delete(`http://localhost:9090/api/societies/${id}`);
    fetchSocieties();
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:9090/api/societies/${editSociety.id}`,
        editSociety
      );
      setEditSociety(null);
      fetchSocieties();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Societies</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        {["ACTIVE", "INACTIVE"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold
              ${activeTab === tab ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SOCIETY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {societies.map(s => (
          <div key={s.id} className="relative bg-white p-5 rounded-xl shadow">

            {/* 3 DOT MENU */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
            >
              <MoreVertical size={18} />
            </button>

            {openMenuId === s.id && (
              <div className="absolute right-4 top-10 bg-white shadow rounded w-32 z-10">
                <button
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setEditSociety(s); // ✅ OPEN MODAL
                    setOpenMenuId(null);
                  }}
                >
                  ✏️ Update
                </button>

                <button
                  className="block w-full px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(s.id)}>
                  🗑 Delete
                </button>
              </div>
            )}

            <h2 className="font-bold text-lg">🏢 {s.name}</h2>
            <p className="text-sm text-gray-500">Admin Name : {s.societyAdmin.adminName}</p>
            <p className="text-sm text-gray-600">City : {s.city}</p>
            <p className="text-sm text-gray-500">Address : {s.address}</p>
            
            {/* VIEW DETAILS */}
            <button
              onClick={() => onViewDetails(s)}
              className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* ================= UPDATE MODAL ================= */}
      {editSociety && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 relative">

            <button
              className="absolute top-3 right-3"
              onClick={() => setEditSociety(null)}
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4">Update Society</h2>

            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="Society Name"
              value={editSociety.name}
              onChange={e =>
                setEditSociety({ ...editSociety, name: e.target.value })
              }
            />

            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="City"
              value={editSociety.city}
              onChange={e =>
                setEditSociety({ ...editSociety, city: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 mb-4 rounded"
              placeholder="Address"
              value={editSociety.address}
              onChange={e =>
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
                className="px-4 py-2 bg-indigo-500 text-white rounded"
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
