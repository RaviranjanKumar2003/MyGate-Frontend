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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className=" min-h-screen lg:-ml-12 mt-7 p-6 bg-linear-to-br
from-[#eef2ff]
via-[#ffffff]
to-[#ecfeff]">

      {/* HEADER */}
<div className="mb-8">
  <h1 className="text-3xl font-bold text-slate-800">
    Society Management
  </h1>

  <p className="text-slate-500 mt-2">
    Manage and monitor all registered societies
  </p>
</div>

      {/* TABS */}
<div className="mb-8">
  <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">

    {["ACTIVE", "INACTIVE"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`
        px-6 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-300

        ${
          activeTab === tab
            ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
            : "text-slate-600 hover:bg-slate-100"
        }
        `}
      >
        {tab}
      </button>
    ))}
  </div>
</div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {societies.map((s) => (
          <div
  key={s.id}
  className="
  relative

  bg-white/80
  backdrop-blur-xl

  border border-white/30
  rounded-3xl

  p-5

  shadow-[0_10px_40px_rgba(0,0,0,0.06)]

  hover:-translate-y-2
  hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]

  transition-all duration-300
  "
>
  {/* Menu Button */}
  <button
    className="
    absolute top-4 right-4

    h-10 w-10

    rounded-xl
    bg-slate-100

    hover:bg-slate-200

    flex items-center justify-center

    transition-all
    "
    onClick={() =>
      setOpenMenuId(
        openMenuId === s.id ? null : s.id
      )
    }
  >
    <MoreVertical size={18} />
  </button>

  {/* Menu Back */}
  {openMenuId === s.id && (
    <div
      ref={(el) =>
        (menuRefs.current[s.id] = el)
      }
      className="
      absolute right-4 top-16

      bg-white
      rounded-2xl

      border border-slate-200

      shadow-xl

      overflow-hidden
      z-20
      "
    >
      <button
        className="
        block w-full
        px-5 py-3

        text-left
        hover:bg-cyan-50
        "
        onClick={() => {
          setEditSociety(s);
          setOpenMenuId(null);
        }}
      >
        ✏️ Update
      </button>

      <button
        className="
        block w-full
        px-5 py-3

        text-left
        text-red-600

        hover:bg-red-50
        "
        onClick={() => handleDelete(s.id)}
      >
        🗑 Delete
      </button>
    </div>
  )}

  {/* Society Icon */}
  <div
    className="
    h-16 w-16

    rounded-2xl

    bg-linear-to-br
    from-cyan-500
    to-blue-600

    flex items-center justify-center

    text-white text-2xl

    shadow-lg shadow-cyan-500/30
    "
  >
    🏢
  </div>

  <h2 className="mt-5 text-xl font-bold text-slate-800">
    {s.name}
  </h2>

  <div className="mt-4 space-y-2">

    <p className="text-sm text-slate-600">
      👤 {s.societyAdmin?.adminName}
    </p>

    <p className="text-sm text-slate-600">
      📍 {s.city}
    </p>

    <p className="text-sm text-slate-500 line-clamp-2">
      {s.address}
    </p>
  </div>

  <button
    onClick={() => onViewDetails(s)}
    className="
    mt-6

    w-full py-3

    rounded-2xl

    bg-linear-to-r
    from-cyan-500
    to-blue-600

    text-white
    font-semibold

    hover:scale-[1.02]

    transition-all
    "
  >
    View Details
  </button>
</div>
        ))}
      </div>

      {editSociety && (
  <div
    className="
    fixed inset-0

    bg-black/60
    backdrop-blur-md

    flex items-center justify-center

    z-50
    px-4
    "
  >
    <div
      className="
      bg-white

      w-full max-w-lg

      rounded-3xl

      overflow-hidden

      shadow-[0_25px_80px_rgba(0,0,0,0.25)]
      "
    >
      {/* Header */}
      <div
        className="
        bg-gradient-to-r
        from-cyan-600
        to-blue-700

        px-6 py-5

        text-white

        flex items-center justify-between
        "
      >
        <h2 className="text-xl font-bold">
          Update Society
        </h2>

        <button
          onClick={() =>
            setEditSociety(null)
          }
          className="
          h-10 w-10

          rounded-xl

          bg-white/10

          flex items-center justify-center

          hover:bg-white/20
          "
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <div className="p-6">

        <div className="space-y-4">

          <input
            className="
            w-full

            px-4 py-3

            rounded-xl

            border border-slate-200

            focus:ring-2
            focus:ring-cyan-500
            outline-none
            "
            placeholder="Society Name"
            value={editSociety.name}
            onChange={(e) =>
              setEditSociety({
                ...editSociety,
                name: e.target.value,
              })
            }
          />

          <input
            className="
            w-full

            px-4 py-3

            rounded-xl

            border border-slate-200

            focus:ring-2
            focus:ring-cyan-500
            outline-none
            "
            placeholder="City"
            value={editSociety.city}
            onChange={(e) =>
              setEditSociety({
                ...editSociety,
                city: e.target.value,
              })
            }
          />

          <textarea
            rows={4}
            className="
            w-full

            px-4 py-3

            rounded-xl

            border border-slate-200

            focus:ring-2
            focus:ring-cyan-500
            outline-none
            "
            placeholder="Address"
            value={editSociety.address}
            onChange={(e) =>
              setEditSociety({
                ...editSociety,
                address: e.target.value,
              })
            }
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() =>
              setEditSociety(null)
            }
            className="
            px-5 py-3

            rounded-xl

            bg-slate-100
            hover:bg-slate-200

            font-medium
            "
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="
            px-5 py-3

            rounded-xl

            bg-gradient-to-r
            from-cyan-500
            to-blue-600

            text-white
            font-semibold
            "
          >
            Update Society
          </button>

        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AllSocieties;