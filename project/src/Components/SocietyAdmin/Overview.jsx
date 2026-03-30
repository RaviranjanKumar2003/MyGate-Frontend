import React, { useEffect, useState } from "react";
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
      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{b.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              <p className="flex gap-2">
                <Layers size={16} /> Floors: {b.totalFloors}
              </p>
              <p className="flex gap-2">
                <Home size={16} /> Flats: {b.totalFlats}
              </p>
            </div>
          </div>

          {/* BUILDING UPDATE / DELETE */}
          <div className="flex gap-2 relative">
  {/* 3 DOT MENU ICON */}
  <MoreVertical
    className="cursor-pointer"
    onClick={() =>
      setOpenMenu(openMenu === `building-${b.id}` ? null : `building-${b.id}`)
    }
  />

  {/* DROPDOWN MENU */}
  {openMenu === `building-${b.id}` && (
    <div className="absolute right-0 top-6 bg-white shadow rounded z-20 w-44 text-sm">
      
      {/* UPDATE */}
      <button
        className="px-3 py-2 hover:bg-gray-100 w-full text-left"
        onClick={() => {
          updateBuilding(b);
          setOpenMenu(null);
        }}
      >
        ✏️ Update Building
      </button>

      {/* DELETE */}
      <button
        className="px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
        onClick={() => {
          deleteBuilding(b.id);
          setOpenMenu(null);
        }}
      >
        🗑 Delete Building
      </button>

      {/* ADD FLOOR */}
      <button
        className="px-3 py-2 text-green-600 hover:bg-green-50 w-full text-left"
        onClick={() => {
          addFloor(b.id);
          setOpenMenu(null);
        }}>
        ➕ Add Floor
      </button>
    </div>
  )}
  </div>

        </div>

        {/* EXPAND */}
        <button
          onClick={() =>
            setExpanded((p) => ({ ...p, [b.id]: !p[b.id] }))
          }
          className="flex items-center gap-2 text-sm text-indigo-600"
        >
          {isOpen ? <ChevronUp /> : <ChevronDown />}
          {isOpen ? "Hide floors" : "View floors & flats"}
        </button>

        {/* FLOORS */}
        {isOpen &&
          b.floorsData.map((floor) => (
            <div
              key={floor.id}
              className="border rounded-lg p-3 bg-gray-50 relative"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  Floor: {floor.floorNumber}
                </span>

                {/* FLOOR 3 DOT */}
                <MoreVertical
                  className="cursor-pointer"
                  onClick={() =>
                    setOpenMenu(openMenu === floor.id ? null : floor.id)
                  }
                />
              </div>

              {/* FLOOR MENU */}
              {openMenu === floor.id && (
                <div className="absolute right-3 top-8 bg-white shadow rounded z-10 text-sm w-44">
                  {/* ALWAYS */}
                  <button
                    className="px-3 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => updateFloor(b.id, floor)}
                  >
                   ✏️ Update Floor
                  </button>

                  <button
                    className="px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                    onClick={() => deleteFloor(b.id, floor.id)}
                  >
                   🗑 Delete Floor
                  </button>

                  <button
                    onClick={() => addFlat(b.id, floor.id)}
                    className="px-3 py-2 text-green-600 hover:bg-green-50 w-full text-left">
                    ➕ Add Flat
                  </button>

                  {/* 🔥 MOBILE ONLY – SELECTED FLAT ONLY */}
                  {selectedFlat && (
                    <div className="md:hidden border-t">
                      <button
                        className="px-3 py-2 hover:bg-gray-100 w-full text-left"
                        onClick={() =>
                          updateFlat(b.id, floor.id, selectedFlat)
                        }
                      >
                        Update Flat ({selectedFlat.flatNumber})
                      </button>

                      <button
                        className="px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                        onClick={() =>
                          deleteFlat(b.id, floor.id, selectedFlat)
                        }
                      >
                        Delete Flat ({selectedFlat.flatNumber})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FLATS – DESKTOP HOVER */}
              <div className="mt-2 flex flex-wrap gap-2">
                {floor.flats.map((flat) => (
                  <div
                    key={flat.id}
                    onClick={() => setSelectedFlat(flat)}
                    className={`group relative px-2 py-1 rounded text-xs cursor-pointer
                      ${
                        selectedFlat?.id === flat.id
                          ? "bg-indigo-300 text-indigo-900"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                  >
                    {flat.flatNumber}

                    {/* DESKTOP HOVER */}
                    <div className="hidden md:group-hover:flex absolute -top-2 -right-2 bg-white shadow rounded">
                      <Pencil
                        size={14}
                        className="m-1 cursor-pointer"
                        onClick={() =>
                          updateFlat(b.id, floor.id, flat)
                        }
                      />
                      <Trash2
                        size={14}
                        className="m-1 cursor-pointer text-red-600"
                        onClick={() =>
                          deleteFlat(b.id, floor.id, flat)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Buildings Management</h2>

      {/* ADD BUILDING */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          value={buildingName}
          onChange={(e) => setBuildingName(e.target.value)}
          placeholder="Enter building name"
          className="border px-3 py-2 rounded w-full sm:w-72"
        />

        <button
          onClick={addBuilding}
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
        >
         Add Building
        </button>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((b) => (
          <BuildingCard key={b.id} b={b} />
        ))}
      </div>

      {toast.show && (
        <div className="fixed top-6 right-6 bg-red-500 text-white px-4 py-2 rounded">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
