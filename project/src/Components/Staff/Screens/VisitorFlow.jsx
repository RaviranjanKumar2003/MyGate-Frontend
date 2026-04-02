
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Phone, Camera, Building2, Check } from "lucide-react";
import { useLocation } from "react-router-dom";

const SOCIETY_ID = localStorage.getItem("societyId");

export default function VisitorFlow() {
  const { state } = useLocation();
  const purpose = state?.purpose; // GUEST / CAB / DELIVERY etc

  const [step, setStep] = useState(1);

  const [mobile, setMobile] = useState("");
  const [image, setImage] = useState(null);
  const [visitorId, setVisitorId] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");

  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [flatId, setFlatId] = useState("");

  /* ================= MOBILE ================= */
  const createVisitor = async () => {
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    const res = await axios.post(
      `${BASE_URL}/visitors/society/${SOCIETY_ID}`,
      {
        mobileNumber: mobile,
        visitorPurpose: purpose
      }
    );

    setVisitorId(res.data?.data?.id || res.data?.id);
    setStep(2);
  } catch (err) {
    console.error("Create visitor failed", err);
    alert("Failed to create visitor ❌");
  }
};

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (file) => {
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    const formData = new FormData();
    formData.append("image", file);

    await axios.post(
      `${BASE_URL}/visitors/image/upload/${visitorId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setStep(3);
  } catch (err) {
    console.error("Image upload failed", err);
    alert("Failed to upload image ❌");
  }
};

  /* ================= COMPANIES ================= */
  useEffect(() => {
  if (step === 3) {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    axios
      .get(`${BASE_URL}/companies`)
      .then(res => setCompanies(res.data))
      .catch(console.error);
  }
}, [step]);

  /* ================= BUILDINGS ================= */
  useEffect(() => {
  if (step === 4) {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    axios
      .get(`${BASE_URL}/societies/${SOCIETY_ID}/buildings`)
      .then(res => setBuildings(res.data))
      .catch(console.error);
  }
}, [step]);

  useEffect(() => {
  if (!buildingId) return;

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  axios
    .get(`${BASE_URL}/floors/society/${SOCIETY_ID}/building/${buildingId}/get`)
    .then(res => setFloors(res.data))
    .catch(console.error);
}, [buildingId]);

  useEffect(() => {
  if (!floorId) return;

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  axios
    .get(`${BASE_URL}/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}`)
    .then(res => setFlats(res.data))
    .catch(console.error);
}, [floorId]);

  /* ================= SUBMIT ================= */
  const submit = async () => {
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    await axios.put(
      `${BASE_URL}/visitors/${visitorId}/assign`,
      {
        companyId,
        buildingId,
        floorId,
        flatId
      }
    );

    alert("Visitor Added ✅");
  } catch (err) {
    console.error("Assign visitor failed", err);
    alert("Failed to add visitor ❌");
  }
};

  return (
    <div className="min-h-screen bg-[#0b1d2d] text-white p-4 pt-16">

      {/* STEP 1: MOBILE */}
      {step === 1 && (
        <input
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          placeholder="Mobile Number"
          className="w-full p-3 rounded-xl text-black"
        />
      )}

      {step === 1 && (
        <button onClick={createVisitor}>Continue</button>
      )}

      {/* STEP 2: IMAGE */}
      {step === 2 && (
        <label className="flex flex-col items-center">
          <Camera />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={e => uploadImage(e.target.files[0])}
          />
          Upload Image
        </label>
      )}

      {/* STEP 3: COMPANY */}
      {step === 3 && (
        <select
          onChange={e => {
            setCompanyId(e.target.value);
            setStep(4);
          }}
        >
          <option>Select Company</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* STEP 4–6: BUILDING / FLOOR / FLAT */}
      {step >= 4 && (
        <>
          <select onChange={e => setBuildingId(e.target.value)}>
            <option>Select Building</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select onChange={e => setFloorId(e.target.value)}>
            <option>Select Floor</option>
            {floors.map(f => (
              <option key={f.id} value={f.id}>{f.floorNumber}</option>
            ))}
          </select>

          <select onChange={e => setFlatId(e.target.value)}>
            <option>Select Flat</option>
            {flats.map(f => (
              <option key={f.id} value={f.id}>{f.flatNumber}</option>
            ))}
          </select>

          <button onClick={submit}>
            <Check /> Submit
          </button>
        </>
      )}
    </div>
  );
}
