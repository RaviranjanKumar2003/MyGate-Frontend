import React, { useEffect, useState } from "react";
import axios from "axios";

function BuildingContent({ society, onBack }) {
  const [buildings, setBuildings] = useState([]);
  const [inactiveBuildings, setInactiveBuildings] = useState([]);
  const [floorsMap, setFloorsMap] = useState({});
  const [flatsMap, setFlatsMap] = useState({});
  const [activeTab, setActiveTab] = useState("active");

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, inactiveRes] = await Promise.all([
          axios.get(`${BASE_URL}/societies/${society.id}/buildings`),
          axios.get(`${BASE_URL}/societies/${society.id}/buildings/inactive`),
        ]);

        const activeBuildings = Array.isArray(activeRes.data)
          ? activeRes.data
          : [];
        const inactiveBuildings = Array.isArray(inactiveRes.data)
          ? inactiveRes.data
          : [];

        setBuildings(activeBuildings);
        setInactiveBuildings(inactiveBuildings);

        /* FLOORS */
        const floorPromises = activeBuildings.map((b) =>
          axios.get(
            `${BASE_URL}/floors/society/${society.id}/building/${b.id}/summary`
          )
        );

        /* FLATS */
        const flatPromises = activeBuildings.map((b) =>
          axios.get(`${BASE_URL}/flats/building/${b.id}`)
        );

        const floorResults = await Promise.all(floorPromises);
        const flatResults = await Promise.all(flatPromises);

        const floorsData = {};
        floorResults.forEach((res, idx) => {
          floorsData[activeBuildings[idx].id] = {
            total: res.data.totalFloor ?? 0,
          };
        });

        const flatsData = {};
        flatResults.forEach((res, idx) => {
          flatsData[activeBuildings[idx].id] = res.data.length ?? 0;
        });

        setFloorsMap(floorsData);
        setFlatsMap(flatsData);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [society.id]);

  const dataToShow = activeTab === "active" ? buildings : inactiveBuildings;

  /* ================= UI ================= */
  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 rounded-full bg-white shadow hover:shadow-md text-indigo-600 font-semibold transition"
      >
        ← Back
      </button>

      {/* SOCIETY HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          🏢 {society.name}
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          📍 {society.address}
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold transition
          ${
            activeTab === "active"
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
              : "bg-white border hover:bg-gray-100"
          }`}
        >
          Active ({buildings.length})
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold transition
          ${
            activeTab === "inactive"
              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow"
              : "bg-white border hover:bg-gray-100"
          }`}
        >
          Inactive ({inactiveBuildings.length})
        </button>
      </div>

      {/* BUILDINGS */}
      {dataToShow.length === 0 ? (
        <p className="text-gray-400">No buildings found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dataToShow.map((b) => (
            <div
              key={b.id}
              className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-lg font-bold text-indigo-600">
                🏢 {b.name}
              </h3>

              {/* STATS */}
              <div className="flex gap-3 mt-4 flex-wrap">

                <div className="flex-1 min-w-[120px] bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Floors</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {floorsMap[b.id]?.total ?? 0}
                  </p>
                </div>

                <div className="flex-1 min-w-[120px] bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Flats</p>
                  <p className="text-lg font-bold text-purple-600">
                    {flatsMap[b.id] ?? 0}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuildingContent;