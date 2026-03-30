import React, { useEffect, useState } from "react";
import axios from "axios";

function BuildingContent({ society, onBack }) {
  const [buildings, setBuildings] = useState([]);
  const [inactiveBuildings, setInactiveBuildings] = useState([]);
  const [floorsMap, setFloorsMap] = useState({});
  const [flatsMap, setFlatsMap] = useState({});
  const [activeTab, setActiveTab] = useState("active");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // BUILDINGS
        const [activeRes, inactiveRes] = await Promise.all([
          axios.get(
            `http://localhost:9090/api/societies/${society.id}/buildings`
          ),
          axios.get(
            `http://localhost:9090/api/societies/${society.id}/buildings/inactive`
          ),
        ]);

        const activeBuildings = Array.isArray(activeRes.data)
          ? activeRes.data
          : [];
        const inactiveBuildings = Array.isArray(inactiveRes.data)
          ? inactiveRes.data
          : [];

        setBuildings(activeBuildings);
        setInactiveBuildings(inactiveBuildings);

        /* ===== FLOORS SUMMARY ===== */
        const floorPromises = activeBuildings.map((b) =>
          axios.get(
            `http://localhost:9090/api/floors/society/${society.id}/building/${b.id}/summary`
          )
        );

        const flatPromises = activeBuildings.map((b) =>
          axios.get(
            `http://localhost:9090/api/flats/building/${b.id}`
          )
        );

        const floorResults = await Promise.all(floorPromises);
        const flatResults = await Promise.all(flatPromises);

        const floorsData = {};
        floorResults.forEach((res, idx) => {
          const buildingId = activeBuildings[idx].id;
          floorsData[buildingId] = {
            total: res.data.totalFloor ?? 0,
          };
        });

        const flatsData = {};
        flatResults.forEach((res, idx) => {
          const buildingId = activeBuildings[idx].id;
          flatsData[buildingId] = res.data.length ?? 0; // Assuming API returns array of flats
        });

        setFloorsMap(floorsData);
        setFlatsMap(flatsData);

      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
  }, [society.id]);

  const dataToShow = activeTab === "active" ? buildings : inactiveBuildings;

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 text-indigo-600 font-semibold"
      >
        ← Back to Societies
      </button>

      {/* SOCIETY INFO */}
      <h1 className="text-2xl font-bold">{society.name}</h1>
      <p className="text-gray-500 mb-6">{society.address}</p>

      {/* BUILDING TABS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "active"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Active Buildings ({buildings.length})
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "inactive"
              ? "bg-red-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Inactive Buildings ({inactiveBuildings.length})
        </button>
      </div>

      {/* BUILDING CARDS */}
      {dataToShow.length === 0 ? (
        <p className="text-gray-400">No buildings found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataToShow.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow-md p-5 border"
            >
              <h3 className="text-lg font-bold text-indigo-700">
                {b.name}
              </h3>

              <div className="mt-3 text-sm space-y-1">
                <p>
                  Total Floors: <b>{floorsMap[b.id]?.total ?? 0}</b>
                </p>

                <p>
                  Total Flats: <b>{flatsMap[b.id] ?? 0}</b>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuildingContent;
