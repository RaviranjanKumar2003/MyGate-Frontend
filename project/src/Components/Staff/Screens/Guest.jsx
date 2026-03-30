import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import { ArrowLeft, Check, Phone, User, Camera, Building2 } from "lucide-react";

const SOCIETY_ID = localStorage.getItem("societyId");

/* ================= SMALL COMPONENTS ================= */
const Back = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm text-gray-500 mb-4"
  >
    <ArrowLeft size={18} /> Back
  </button>
));

const Card = memo(({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </div>
));

/* ================= MAIN ================= */
export default function Guest() {
  const [step, setStep] = useState(1);

  const [mobileNumber, setMobileNumber] = useState("");
  const [name, setName] = useState("");

  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [flatId, setFlatId] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH BUILDINGS ================= */
  useEffect(() => {
    if (step === 4) {
      axios
        .get(`http://localhost:9090/api/societies/${SOCIETY_ID}/buildings`)
        .then(res => setBuildings(res.data.data || res.data));
    }
  }, [step]);

  /* ================= FETCH FLOORS ================= */
  useEffect(() => {
    if (!buildingId) return;
    axios
      .get(`http://localhost:9090/api/floors/society/${SOCIETY_ID}/building/${buildingId}/get`)
      .then(res => setFloors(res.data.data || res.data));
  }, [buildingId]);

  /* ================= FETCH FLATS ================= */
  useEffect(() => {
    if (!floorId) return;
    axios
      .get(`http://localhost:9090/api/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}`)
      .then(res => setFlats(res.data.data || res.data));
  }, [floorId]);

  /* ================= SUBMIT ================= */
  const submitVisitor = async () => {
    setLoading(true);
    try {
      // 1️⃣ CREATE VISITOR (JSON)
      const res = await axios.post(
        `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}/flat/${flatId}`,
        {
          name,
          mobileNumber,
          visitorPurpose: "GUEST"
        }
      );

      const visitorId = res.data?.data?.id || res.data?.id;

      // 2️⃣ UPLOAD IMAGE (MULTIPART)
      if (visitorId && imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);

        await axios.post(
          `http://localhost:9090/api/visitors/image/upload/${visitorId}`,
          fd
        );
      }

      alert("Visitor Added Successfully ✅");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to add visitor ❌");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setMobileNumber("");
    setName("");
    setBuildingId("");
    setFloorId("");
    setFlatId("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0b1d2d] p-4 lg:ml-2">
      <div className="w-full max-w-sm">

        {/* STEP 1 */}
        {step === 1 && (
          <Card title="Mobile Number" icon={<Phone size={18} />}>
            <input
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              className="w-full p-3 border rounded-xl"
              placeholder="10 digit mobile"
            />
            <button
              disabled={mobileNumber.length !== 10}
              onClick={() => setStep(2)}
              className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl"
            >
              Continue
            </button>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Card title="Visitor Name" icon={<User size={18} />}>
            <Back onClick={() => setStep(1)} />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 border rounded-xl"
              placeholder="Full name"
            />
            <button
              disabled={!name}
              onClick={() => setStep(3)}
              className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl"
            >
              Continue
            </button>
          </Card>
        )}

        {/* STEP 3 */}
        {step === 3 && (
  <Card title="Photo" icon={<Camera size={18} />}>
    <Back onClick={() => setStep(2)} />

    {/* HIDDEN CAMERA INPUT */}
    <input
      id="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={e => {
        const file = e.target.files[0];
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      }}
    />

    {/* CAMERA BUTTON */}
    <button
      onClick={() => document.getElementById("cameraInput").click()}
      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-red-400 rounded-xl text-red-600 font-semibold"
    >
      <Camera size={18} />
      Open Camera
    </button>

    {/* PREVIEW */}
    {imagePreview && (
      <img
        src={imagePreview}
        className="mt-4 h-40 w-full object-cover rounded-xl"
      />
    )}

    <button
      disabled={!imageFile}
      onClick={() => setStep(4)}
      className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl disabled:opacity-40"
    >
      Continue
    </button>
  </Card>
)}


        {/* STEP 4 */}
        {step === 4 && (
          <Card title="Building" icon={<Building2 size={18} />}>
            <Back onClick={() => setStep(3)} />
            <select className="w-full p-3 border rounded-xl" onChange={e => setBuildingId(e.target.value)}>
              <option value="">Select Building</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button disabled={!buildingId} onClick={() => setStep(5)} className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl">
              Continue
            </button>
          </Card>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <Card title="Floor" icon={<Building2 size={18} />}>
            <Back onClick={() => setStep(4)} />
            <select className="w-full p-3 border rounded-xl" onChange={e => setFloorId(e.target.value)}>
              <option value="">Select Floor</option>
              {floors.map(f => (
                <option key={f.id} value={f.id}>{f.floorNumber}</option>
              ))}
            </select>
            <button disabled={!floorId} onClick={() => setStep(6)} className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl">
              Continue
            </button>
          </Card>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <Card title="Flat" icon={<Building2 size={18} />}>
            <Back onClick={() => setStep(5)} />
            <select className="w-full p-3 border rounded-xl" onChange={e => setFlatId(e.target.value)}>
              <option value="">Select Flat</option>
              {flats.map(f => (
                <option key={f.id} value={f.id}>{f.flatNumber}</option>
              ))}
            </select>
            <button
              disabled={!flatId || loading}
              onClick={submitVisitor}
              className="mt-5 w-full py-3 bg-green-500 text-white rounded-xl flex justify-center gap-2"
            >
              <Check size={18} /> Submit
            </button>
          </Card>
        )}

      </div>
    </div>
  );
}
