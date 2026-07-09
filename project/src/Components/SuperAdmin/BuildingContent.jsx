import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Building2,
  Layers3,
  Home,
  ArrowLeft,
} from "lucide-react";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [society.id]);

  const dataToShow = activeTab === "active" ? buildings : inactiveBuildings;

  /* ================= UI ================= */

    return (
  <div
    className="
    min-h-screen
    p-6
     w-full
    bg-linear-to-br
    from-[#eef2ff]
    via-[#fdf4ff]
    to-[#ecfeff]
    lg:-ml-11
    relative
    overflow-hidden
    "
  >
    {/* Background Effects */}
    <div className="absolute top-0 left-0 h-72 w-72 bg-purple-400/20 rounded-full blur-3xl"></div>
    <div className="absolute top-20 right-0 h-80 w-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-1/3 h-96 w-96 bg-pink-400/20 rounded-full blur-3xl"></div>

    <div className="relative z-10">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="
        flex items-center gap-2
         mt-10
        px-5 py-3

        rounded-2xl

        bg-white/80
        backdrop-blur-xl

        border border-white

        shadow-lg

        text-violet-600
        font-semibold

        hover:-translate-y-1
        hover:shadow-xl

        transition-all
        "
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* HEADER */}
      <div className="mt-8 mb-8">

        <div className="flex items-center gap-5">

          <div
            className="
            h-20 w-20

            rounded-3xl

            bg-linear-to-br
            from-violet-600
            via-purple-600
            to-pink-500

            flex items-center justify-center

            text-white

            shadow-xl shadow-purple-500/30
            "
          >
            <Building2 size={40} />
          </div>

          <div>

            <h1
              className="
              text-4xl
              font-black

              bg-gradient-to-r
              from-violet-600
              via-purple-600
              to-pink-500

              bg-clip-text
              text-transparent
              "
            >
              {society.name}
            </h1>

            <p className="text-slate-500 mt-2">
              📍 {society.address}
            </p>

          </div>

        </div>

      </div>

      {/* TABS */}
      <div className="mb-8">

        <div
          className="
          inline-flex

          p-1.5

          rounded-2xl

          bg-white/70
          backdrop-blur-xl

          border border-white

          shadow-lg
          "
        >

          <button
            onClick={() => setActiveTab("active")}
            className={`
            px-6 py-3
            rounded-xl

            font-semibold
            transition-all

            ${
              activeTab === "active"
                ? "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white shadow-xl"
                : "text-slate-700 hover:bg-white"
            }
            `}
          >
            Active ({buildings.length})
          </button>

          <button
            onClick={() => setActiveTab("inactive")}
            className={`
            px-6 py-3
            rounded-xl

            font-semibold
            transition-all

            ${
              activeTab === "inactive"
                ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xl"
                : "text-slate-700 hover:bg-white"
            }
            `}
          >
            Inactive ({inactiveBuildings.length})
          </button>

        </div>

      </div>

      {/* BUILDINGS */}
      {dataToShow.length === 0 ? (
        <div
          className="
          bg-white/70
          backdrop-blur-xl

          rounded-3xl

          p-10

          text-center

          border border-white

          shadow-lg
          "
        >
          <div className="text-6xl mb-4">
            🏢
          </div>

          <h3 className="text-xl font-bold text-slate-700">
            No Buildings Found
          </h3>

          <p className="text-slate-500 mt-2">
            No building records available.
          </p>
        </div>
      ) : (
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
          "
        >
          {dataToShow.map((b) => (
            <div
              key={b.id}
              className="
              group
              relative

              overflow-hidden

              bg-white/75
              backdrop-blur-2xl

              border border-white

              rounded-[30px]

              p-6

              shadow-[0_15px_50px_rgba(0,0,0,0.08)]

              hover:-translate-y-3
              hover:shadow-[0_25px_70px_rgba(124,58,237,0.20)]

              transition-all duration-500
              "
            >

              {/* Top Line */}
              <div
                className="
                absolute top-0 left-0

                h-1.5 w-full

                bg-gradient-to-r
                from-violet-500
                via-pink-500
                to-cyan-500
                "
              />

              {/* Building Icon */}
              <div
                className="
                h-16 w-16

                rounded-2xl

                bg-gradient-to-br
                from-violet-600
                via-purple-600
                to-pink-500

                flex items-center justify-center

                text-white

                shadow-lg shadow-purple-500/30

                group-hover:scale-110

                transition-all duration-500
                "
              >
                <Building2 size={28} />
              </div>

              <h3
                className="
                mt-5

                text-2xl
                font-bold

                bg-gradient-to-r
                from-violet-700
                to-pink-600

                bg-clip-text
                text-transparent
                "
              >
                {b.name}
              </h3>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">

                <div
                  className="
                  rounded-2xl

                  p-4

                  bg-gradient-to-br
                  from-indigo-50
                  to-violet-100

                  border border-indigo-100
                  "
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Layers3
                      size={16}
                      className="text-violet-600"
                    />
                    <span className="text-xs text-slate-500">
                      Floors
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-violet-600">
                    {floorsMap[b.id]?.total ?? 0}
                  </p>
                </div>

                <div
                  className="
                  rounded-2xl

                  p-4

                  bg-gradient-to-br
                  from-cyan-50
                  to-blue-100

                  border border-cyan-100
                  "
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Home
                      size={16}
                      className="text-cyan-600"
                    />
                    <span className="text-xs text-slate-500">
                      Flats
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-cyan-600">
                    {flatsMap[b.id] ?? 0}
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  </div>
);
}

export default BuildingContent;