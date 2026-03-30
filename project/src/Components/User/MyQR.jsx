import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function Sash() {

  const SOCIETY_ID = Number(localStorage.getItem("societyId"));
  const USER_ID = Number(localStorage.getItem("userId"));
  const USER_NAME = localStorage.getItem("userName");

  const [entryCode, setEntryCode] = useState(null);

  const [buildingId, setBuildingId] = useState(null);
  const [floorId, setFloorId] = useState(null);
  const [flatId, setFlatId] = useState(null);

  const [visitorName, setVisitorName] = useState("");
  const [visitorMobile, setVisitorMobile] = useState("");
  const [expiryTime, setExpiryTime] = useState("");

  const [visitorCode, setVisitorCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const qrUrl = `http://localhost:9090/api/users/society/${SOCIETY_ID}/qr/${USER_ID}`;

  /* ================= FETCH USER DATA ================= */

  useEffect(() => {
    api
      .get(`/users/society/${SOCIETY_ID}/user/${USER_ID}`)
      .then((res) => {

        const user = res.data;

        setEntryCode(user.entryCode);
        setBuildingId(user.buildingId);
        setFloorId(user.floorId);
        setFlatId(user.flatId);

      })
      .catch((err) => console.error(err));
  }, [SOCIETY_ID, USER_ID]);

  /* ================= GENERATE VISITOR ================= */

  const handleGenerateVisitorCode = async () => {

    if (!visitorName || !visitorMobile) {
      alert("Enter visitor name and mobile");
      return;
    }

    if (!buildingId || !floorId || !flatId) {
      alert("Flat info not loaded");
      return;
    }

    setLoading(true);

    try {

      /* 1️⃣ CREATE VISITOR */

      await api.post(
        `/visitors/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}/flat/${flatId}`,
        {
          name: visitorName,
          mobileNumber: visitorMobile,
          visitorPurpose: "GUEST"
        }
      );

      /* 2️⃣ EXPIRY TIME FORMAT (MATCH DTO) */

      const finalExpiryTime = expiryTime
        ? expiryTime
        : new Date(Date.now() + 2 * 60 * 60 * 1000)
            .toISOString()
            .slice(0,16);

      /* 3️⃣ GENERATE VISITOR CODE */

      const codeRes = await api.post(
        `/verification/society/${SOCIETY_ID}/generate-visitor`,
        {
          societyId: SOCIETY_ID,
          userId: USER_ID,
          visitorName: visitorName,
          expiryTime: finalExpiryTime
        }
      );

      setVisitorCode(codeRes.data);

      setVisitorName("");
      setVisitorMobile("");
      setExpiryTime("");

    } catch (err) {

      console.log("Backend Error:", err.response);

      alert(
        err.response?.data?.message ||
        "Failed to generate visitor code"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start lg:space-x-8 p-4 space-y-6 lg:space-y-0">

      {/* USER QR */}

      <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-1/2 flex flex-col items-center">

        <h2 className="text-xl font-bold mb-4">
          {USER_NAME}'s Entry QR Code
        </h2>

        <img
          src={qrUrl}
          alt="QR"
          className="h-64 w-64 border rounded-lg"
        />

        {entryCode && (
          <p className="mt-3 font-semibold text-indigo-600 tracking-widest">
            Entry Code: {entryCode}
          </p>
        )}

      </div>

      {/* VISITOR CODE */}

      <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-1/2">

        <h2 className="text-xl font-bold mb-4 text-center">
          Generate Visitor Entry Code
        </h2>

        <input
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
          placeholder="Visitor Name"
          className="border rounded-lg px-3 py-2 w-full mb-3"
        />

        <input
          value={visitorMobile}
          onChange={(e) => setVisitorMobile(e.target.value)}
          placeholder="Visitor Mobile"
          className="border rounded-lg px-3 py-2 w-full mb-3"
        />

        <input
          type="datetime-local"
          value={expiryTime}
          onChange={(e) => setExpiryTime(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full mb-3"
        />

        <button
          onClick={handleGenerateVisitorCode}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
        >
          {loading ? "Generating..." : "Generate Visitor Code"}
        </button>

        {visitorCode && (
          <div className="mt-4 bg-green-50 p-3 rounded-lg text-sm">

            <p><b>Name:</b> {visitorCode.visitorName}</p>

            <p><b>Code:</b> {visitorCode.code}</p>

            <p>
              <b>Expires:</b>{" "}
              {visitorCode.expiryTime
                ? new Date(visitorCode.expiryTime).toLocaleString()
                : "N/A"}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default Sash;