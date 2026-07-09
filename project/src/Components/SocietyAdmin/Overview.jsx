import React, { useEffect, useState,useRef  } from "react";
import api from "../../api/axios";
import {
  Layers,
  Home,
  Pencil,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const SOCIETY_ID = localStorage.getItem("societyId");

export default function Overview() {

  const [buildings, setBuildings] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [buildingName, setBuildingName] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null); // ✅ MOBILE ONLY
  const [toast, setToast] = useState({ show: false, msg: "" });
  
  const menuRef = useRef(null);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };


  /* ================= ADD BUILDING ================= */
    const addBuilding = async () => {
      if (!buildingName.trim()) {
        showToast("Building name required");
        return;
      }

  try {
    await api.post(`/societies/${SOCIETY_ID}/buildings`, {
      name: buildingName
    });
    setBuildingName("");
    fetchBuildings();
  } catch {
    showToast("Failed to add building");
  }
};


   useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpenMenu(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  /* ================= FETCH ================= */
  const fetchBuildings = async () => {
    try {
      const res = await api.get(`/societies/${SOCIETY_ID}/buildings`);

      const enriched = await Promise.all(
        res.data.map(async (b) => {
          const floorRes = await api.get(
            `/floors/society/${SOCIETY_ID}/building/${b.id}/get`
          );

          const floorsData = await Promise.all(
            floorRes.data.map(async (f) => {
              const flatRes = await api.get(
                `/flats/society/${SOCIETY_ID}/building/${b.id}/floor/${f.id}`
              );
              return { ...f, flats: flatRes.data };
            })
          );

          return {
            ...b,
            floorsData,
            totalFloors: floorsData.length,
            totalFlats: floorsData.reduce(
              (sum, f) => sum + f.flats.length,
              0
            )
          };
        })
      );

      setBuildings(enriched);
    } catch {
      showToast("Failed to load buildings");
    }
  };


  useEffect(() => {
    fetchBuildings();
  }, []);

  /* ================= BUILDING ================= */
  const updateBuilding = async (b) => {
    const name = prompt("New building name", b.name);
    if (!name) return;
    await api.put(`/societies/${SOCIETY_ID}/buildings/${b.id}`, { name });
    fetchBuildings();
  };

  const deleteBuilding = async (id) => {
    if (!window.confirm("Delete this building?")) return;
    await api.delete(`/societies/${SOCIETY_ID}/buildings/${id}`);
    fetchBuildings();
  };

  /* ================= FLOOR ================= */
  const updateFloor = async (bId, floor) => {
    const floorNumber = prompt("Update floor name", floor.floorNumber);
    if (!floorNumber) return;
    await api.put(
      `/floors/society/${SOCIETY_ID}/building/${bId}/floor/${floor.id}`,
      { floorNumber }
    );
    fetchBuildings();
  };

  const deleteFloor = async (bId, fId) => {
    if (!window.confirm("Delete floor?")) return;
    await api.delete(
      `/floors/society/${SOCIETY_ID}/building/${bId}/floor/${fId}/delete`
    );
    fetchBuildings();
  };

// ===================== Add Floor
  const addFloor = async (bId) => {
  const floorNumber = prompt("Enter floor number/name");
  if (!floorNumber) return;

  try {
    await api.post(
      `/floors/society/${SOCIETY_ID}/building/${bId}/create`,
      { floorNumber }
    );
    fetchBuildings();
  } catch {
    showToast("Failed to add floor");
  }
};


  /* ================= FLAT ================= */
  const updateFlat = async (bId, fId, flat) => {
    if (!flat) return showToast("Select a flat first");
    const num = prompt("Update flat number", flat.flatNumber);
    if (!num) return;

    await api.put(
      `/flats/society/${SOCIETY_ID}/building/${bId}/floor/${fId}/flat/${flat.id}`,
      { flatNumber: num }
    );
    fetchBuildings();
  };

  const deleteFlat = async (bId, fId, flat) => {
    if (!flat) return showToast("Select a flat first");
    if (!window.confirm("Delete flat?")) return;

    await api.delete(
      `/flats/society/${SOCIETY_ID}/building/${bId}/floor/${fId}/flat/${flat.id}`
    );
    fetchBuildings();
  };

//========================== Add Flats
  const addFlat = async (bId, fId) => {
    const flatNumber = prompt("Enter flat number");
    if (!flatNumber) return;

    try {
      await api.post(`/flats/create`, {
        flatNumber,
        societyId: SOCIETY_ID,
        buildingId: bId,
        floorId: fId
      });
      fetchBuildings();
    } catch {
      showToast("Failed to add flat");
    }
  };


  /* ================= UI ================= */
  const BuildingCard = ({ b }) => {
    const isOpen = expanded[b.id];

    return (
  <div
    className="
    bg-white
    rounded-3xl
    overflow-hidden
    border border-slate-200
    shadow-sm
    hover:shadow-2xl
    hover:-translate-y-1
    transition-all duration-300
    "
  >
    {/* HEADER */}
    <div
      className="
      bg-gradient-to-r
      from-indigo-600
      via-violet-600
      to-purple-600
      p-5
      text-white
      "
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold tracking-wide">
            {b.name}
          </h3>

          <p className="text-indigo-100 text-sm mt-1">
            Building Overview
          </p>
        </div>

        {/* BUILDING MENU */}
        <div className="relative">
          <button
  onClick={() =>
    setOpenMenu(
      openMenu === `building-${b.id}`
        ? null
        : `building-${b.id}`
    )
  }
  className="
  h-11 w-11
  rounded-2xl
  bg-white/20
  backdrop-blur-md
  border border-white/20
  hover:bg-white/30
  hover:scale-105
  transition-all duration-200
  flex items-center justify-center
  "
>
  <MoreVertical size={18} />
</button>

          {openMenu === `building-${b.id}` && (
  <div
    ref={menuRef}
    onClick={(e) => e.stopPropagation()}
    className="
    absolute right-0 top-12
    w-64
    rounded-3xl
    bg-white/95
    backdrop-blur-xl
    border border-white/60
    shadow-[0_20px_60px_rgba(0,0,0,0.18)]
    overflow-hidden
    z-50
    animate-in fade-in zoom-in duration-200
    "
  >
    {/* Header */}
    <div className="px-4 py-3 border-b border-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Building Actions
      </p>

      <h4 className="font-semibold text-slate-800 mt-1">
        {b.name}
      </h4>
    </div>

    {/* Update */}
    <button
      onClick={() => {
        updateBuilding(b);
        setOpenMenu(null);
      }}
      className="
      w-full
      flex items-center gap-3
      px-4 py-3
      text-left
      hover:bg-indigo-50
      transition
      "
    >
      <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
        ✏️
      </div>

      <div>
        <p className="font-medium text-slate-800">
          Update Building
        </p>

        <p className="text-xs text-slate-500">
          Edit building details
        </p>
      </div>
    </button>

    {/* Add Floor */}
    <button
      onClick={() => {
        addFloor(b.id);
        setOpenMenu(null);
      }}
      className="
      w-full
      flex items-center gap-3
      px-4 py-3
      text-left
      hover:bg-green-50
      transition
      "
    >
      <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
        ➕
      </div>

      <div>
        <p className="font-medium text-green-700">
          Add Floor
        </p>

        <p className="text-xs text-slate-500">
          Create a new floor
        </p>
      </div>
    </button>

    {/* Delete */}
    <button
      onClick={() => {
        deleteBuilding(b.id);
        setOpenMenu(null);
      }}
      className="
      w-full
      flex items-center gap-3
      px-4 py-3
      text-left
      hover:bg-red-50
      transition
      "
    >
      <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
        🗑
      </div>

      <div>
        <p className="font-medium text-red-600">
          Delete Building
        </p>

        <p className="text-xs text-slate-500">
          Permanently remove building
        </p>
      </div>
    </button>
  </div>
)}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mt-5">

        <div
          className="
          bg-white/15
          backdrop-blur-md
          rounded-2xl
          p-3
          "
        >
          <div className="flex items-center gap-2">
            <Layers size={18} />
            <span className="text-sm">Floors</span>
          </div>

          <h4 className="text-2xl font-bold mt-2">
            {b.totalFloors}
          </h4>
        </div>

        <div
          className="
          bg-white/15
          backdrop-blur-md
          rounded-2xl
          p-3
          "
        >
          <div className="flex items-center gap-2">
            <Home size={18} />
            <span className="text-sm">Flats</span>
          </div>

          <h4 className="text-2xl font-bold mt-2">
            {b.totalFlats}
          </h4>
        </div>

      </div>
    </div>

    {/* BODY */}
    <div className="p-5">

      {/* EXPAND BUTTON */}
      <button
        onClick={() =>
          setExpanded((p) => ({
            ...p,
            [b.id]: !p[b.id]
          }))
        }
        className="
        w-full
        h-12
        rounded-2xl
        border border-slate-200
        bg-slate-50
        hover:bg-indigo-50
        hover:border-indigo-200
        flex items-center justify-center gap-2
        font-medium
        transition
        "
      >
        {isOpen ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}

        {isOpen
          ? "Hide Floors & Flats"
          : "View Floors & Flats"}
      </button>

      {/* FLOORS */}
      {isOpen && (
        <div className="mt-5 space-y-4">

          {b.floorsData.map((floor) => (
            <div
              key={floor.id}
              className="
              bg-slate-50
              border border-slate-200
              rounded-2xl
              p-4
              relative
              "
            >
              {/* FLOOR HEADER */}
              <div className="flex justify-between items-center">

                <div>
                  <h4 className="font-semibold text-slate-800">
                    Floor {floor.floorNumber}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {floor.flats.length} Flats
                  </p>
                </div>

                <div className="relative">
                  <button
  onClick={() =>
    setOpenMenu(
      openMenu === floor.id
        ? null
        : floor.id
    )
  }
  className="
  h-10 w-10
  rounded-xl
  bg-white
  border border-slate-200
  hover:bg-slate-100
  hover:scale-105
  transition-all duration-200
  flex items-center justify-center
  shadow-sm
  "
>
  <MoreVertical size={18} />
</button>

                  {openMenu === floor.id && (
  <div
    ref={menuRef}
    onClick={(e) => e.stopPropagation()}
    className="
    absolute right-0 bottom-12
w-64
rounded-3xl
bg-white/95
backdrop-blur-xl
border border-white/60
shadow-[0_20px_60px_rgba(0,0,0,0.18)]
overflow-hidden
z-[999]
animate-in fade-in zoom-in duration-200
    "
  >
    {/* Header */}
    <div className="px-4 py-3 border-b border-slate-100">
      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
        Floor Actions
      </p>

      <h4 className="font-semibold text-slate-800 mt-1">
        Floor {floor.floorNumber}
      </h4>
    </div>

    {/* Update Floor */}
    <button
      onClick={() => {
        updateFloor(b.id, floor);
        setOpenMenu(null);
      }}
      className="
      w-full
      flex items-center gap-3
      px-4 py-3
      text-left
      hover:bg-indigo-50
      transition
      "
    >
      <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
        ✏️
      </div>

      <div>
        <p className="font-medium text-slate-800">
          Update Floor
        </p>

        <p className="text-xs text-slate-500">
          Change floor details
        </p>
      </div>
    </button>

    {/* Add Flat */}
    <button
      onClick={() => {
        addFlat(b.id, floor.id);
        setOpenMenu(null);
      }}
      className="
      w-full
      flex items-center gap-3
      px-4 py-3
      text-left
      hover:bg-green-50
      transition
      "
    >
      <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
        ➕
      </div>

      <div>
        <p className="font-medium text-green-700">
          Add Flat
        </p>

        <p className="text-xs text-slate-500">
          Create new flat in this floor
        </p>
      </div>
    </button>

    {/* Mobile Flat Actions */}
    {selectedFlat && (
      <>
        <div className="border-t border-slate-100" />

        <button
          onClick={() => {
            updateFlat(b.id, floor.id, selectedFlat);
            setOpenMenu(null);
          }}
          className="
          w-full
          flex items-center gap-3
          px-4 py-3
          text-left
          hover:bg-blue-50
          transition
          md:hidden
          "
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            🏠
          </div>

          <div>
            <p className="font-medium text-blue-700">
              Update Flat
            </p>

            <p className="text-xs text-slate-500">
              {selectedFlat.flatNumber}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            deleteFlat(b.id, floor.id, selectedFlat);
            setOpenMenu(null);
          }}
          className="
          w-full
          flex items-center gap-3
          px-4 py-3
          text-left
          hover:bg-red-50
          transition
          md:hidden
          "
        >
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
            🗑
          </div>

          <div>
            <p className="font-medium text-red-600">
              Delete Flat
            </p>

            <p className="text-xs text-slate-500">
              {selectedFlat.flatNumber}
            </p>
          </div>
        </button>
      </>
    )}

    {/* Delete Floor */}
    <button
      onClick={() => {
        deleteFloor(b.id, floor.id);
        setOpenMenu(null);
      }}
      className="
      w-full
      flex items-center gap-3
      px-4 py-3
      text-left
      hover:bg-red-50
      transition
      "
    >
      <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
        🗑
      </div>

      <div>
        <p className="font-medium text-red-600">
          Delete Floor
        </p>

        <p className="text-xs text-slate-500">
          Permanently remove floor
        </p>
      </div>
    </button>
  </div>
)}
                </div>
              </div>

              {/* FLATS */}
              <div className="flex flex-wrap gap-3 mt-4">

                {floor.flats.map((flat) => (
                  <div
                    key={flat.id}
                    onClick={() =>
                      setSelectedFlat(flat)
                    }
                    className={`
                    group
                    relative
                    px-4 py-2
                    rounded-xl
                    text-sm
                    font-medium
                    cursor-pointer
                    transition-all
                    ${
                      selectedFlat?.id === flat.id
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }
                    `}
                  >
                    {flat.flatNumber}

                    {/* DESKTOP ACTIONS */}
                    <div
                      className="
                      hidden md:group-hover:flex
                      absolute
                      -top-3
                      -right-3
                      bg-white
                      rounded-xl
                      shadow-xl
                      border
                      overflow-hidden
                      "
                    >
                      <button
                        onClick={() =>
                          updateFlat(
                            b.id,
                            floor.id,
                            flat
                          )
                        }
                        className="p-2 hover:bg-slate-100"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() =>
                          deleteFlat(
                            b.id,
                            floor.id,
                            flat
                          )
                        }
                        className="p-2 hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  </div>
);
  };

  return (
  <div className="min-h-screen bg-slate-50">

    {/* HERO SECTION */}
    <div
      className="
      relative overflow-hidden
      bg-gradient-to-r
      from-indigo-700
      via-violet-700
      to-purple-700
      px-6 md:px-10
      py-10
      rounded-b-[40px]
      shadow-xl
      "
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Buildings Management
        </h1>

        <p className="mt-2 text-indigo-100 text-sm md:text-base">
          Manage buildings, floors and flats with complete control.
        </p>
      </div>
    </div>

    <div className="p-6 space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* BUILDINGS */}
        <div
          className="
          bg-white
          rounded-3xl
          p-6
          border border-slate-200
          shadow-sm
          hover:shadow-xl
          transition-all duration-300
          "
        >
          <p className="text-slate-500 text-sm font-medium">
            Total Buildings
          </p>

          <h2 className="text-4xl font-bold text-slate-800 mt-3">
            {buildings.length}
          </h2>

          <div className="mt-4 h-2 rounded-full bg-indigo-100">
            <div className="h-2 rounded-full bg-indigo-600 w-full" />
          </div>
        </div>

        {/* FLOORS */}
        <div
          className="
          bg-white
          rounded-3xl
          p-6
          border border-slate-200
          shadow-sm
          hover:shadow-xl
          transition-all duration-300
          "
        >
          <p className="text-slate-500 text-sm font-medium">
            Total Floors
          </p>

          <h2 className="text-4xl font-bold text-slate-800 mt-3">
            {buildings.reduce(
              (sum, b) => sum + b.totalFloors,
              0
            )}
          </h2>

          <div className="mt-4 h-2 rounded-full bg-violet-100">
            <div className="h-2 rounded-full bg-violet-600 w-full" />
          </div>
        </div>

        {/* FLATS */}
        <div
          className="
          bg-white
          rounded-3xl
          p-6
          border border-slate-200
          shadow-sm
          hover:shadow-xl
          transition-all duration-300
          "
        >
          <p className="text-slate-500 text-sm font-medium">
            Total Flats
          </p>

          <h2 className="text-4xl font-bold text-slate-800 mt-3">
            {buildings.reduce(
              (sum, b) => sum + b.totalFlats,
              0
            )}
          </h2>

          <div className="mt-4 h-2 rounded-full bg-emerald-100">
            <div className="h-2 rounded-full bg-emerald-600 w-full" />
          </div>
        </div>

      </div>

      {/* ADD BUILDING CARD */}
      <div
        className="
        bg-white
        rounded-3xl
        border border-slate-200
        shadow-sm
        overflow-hidden
        "
      >
        <div
          className="
          px-6 py-4
          border-b border-slate-100
          bg-slate-50
          "
        >
          <h3 className="font-semibold text-slate-800 text-lg">
            Add New Building
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Create and manage building structure.
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              value={buildingName}
              onChange={(e) =>
                setBuildingName(e.target.value)
              }
              placeholder="Enter Building Name"
              className="
              flex-1
              h-14
              px-5
              rounded-2xl
              border border-slate-200
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
              text-slate-700
              "
            />

            <button
              onClick={addBuilding}
              className="
              h-14
              px-8
              rounded-2xl
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              text-white
              font-semibold
              shadow-lg
              hover:scale-[1.02]
              hover:shadow-xl
              transition-all duration-300
              "
            >
              + Add Building
            </button>

          </div>
        </div>
      </div>

      {/* BUILDINGS GRID */}
      {buildings.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {buildings.map((b) => (
            <BuildingCard
              key={b.id}
              b={b}
            />
          ))}
        </div>
      ) : (
        <div
          className="
          bg-white
          rounded-3xl
          border border-dashed border-slate-300
          p-14
          text-center
          "
        >
          <h3 className="text-xl font-semibold text-slate-700">
            No Buildings Found
          </h3>

          <p className="text-slate-500 mt-2">
            Start by creating your first building.
          </p>
        </div>
      )}

    </div>

    {/* TOAST */}
    {toast.show && (
      <div
        className="
        fixed top-6 right-6
        px-5 py-3
        rounded-2xl
        bg-red-500
        text-white
        shadow-2xl
        z-50
        animate-pulse
        "
      >
        {toast.msg}
      </div>
    )}

  </div>
);
}