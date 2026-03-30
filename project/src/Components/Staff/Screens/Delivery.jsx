import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Phone,
  User,
  Building2,
  Truck,
  Check,
  Search,
  Camera
} from "lucide-react";

const SOCIETY_ID = localStorage.getItem("societyId");

/* ================= SMALL COMPONENTS ================= */
const Back = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
  >
    <ArrowLeft size={18} /> Back
  </button>
));

const Card = memo(({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
));

/* ================= MAIN ================= */
export default function Delivery() {
  const [step, setStep] = useState(1);

  const [mobileNumber, setMobileNumber] = useState("");
  const [name, setName] = useState("");

  /* IMAGE */
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* COMPANY */
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyId, setCompanyId] = useState(null);

  const [vehicleNumber, setVehicleNumber] = useState("");

  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [flatId, setFlatId] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= FETCH COMPANIES ================= */
  useEffect(() => {
    if (step === 4) {
      axios
        .get("http://localhost:9090/api/companies/type/DELIVERY")
        .then(res => setCompanies(res.data))
        .catch(console.error);
    }
  }, [step]);

  /* ================= FETCH BUILDINGS ================= */
  useEffect(() => {
    if (step === 6) {
      axios
        .get(`http://localhost:9090/api/societies/${SOCIETY_ID}/buildings`)
        .then(res => setBuildings(res.data.data || res.data))
        .catch(console.error);
    }
  }, [step]);

  /* ================= FLOORS ================= */
  useEffect(() => {
    if (!buildingId) return;

    axios
      .get(
        `http://localhost:9090/api/floors/society/${SOCIETY_ID}/building/${buildingId}/get`
      )
      .then(res => {
        setFloors(res.data.data || res.data);
        setStep(7);
      })
      .catch(console.error);
  }, [buildingId]);

  /* ================= FLATS ================= */
  useEffect(() => {
    if (!floorId) return;

    axios
      .get(
        `http://localhost:9090/api/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}`
      )
      .then(res => {
        setFlats(res.data.data || res.data);
        setStep(8);
      })
      .catch(console.error);
  }, [floorId]);

  /* ================= SUBMIT ================= */
  const submitDelivery = async () => {
    setLoading(true);
    try {
      /* 1️⃣ CREATE VISITOR */
      const res = await axios.post(
        `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}/flat/${flatId}`,
        {
          name,
          mobileNumber,
          visitorPurpose: "DELIVERY",
          companyId,
          vehicleNumber
        }
      );

      const visitorId = res.data?.data?.id || res.data?.id;

      /* 2️⃣ UPLOAD IMAGE */
      if (imageFile && visitorId) {
        const imgForm = new FormData();
        imgForm.append("image", imageFile);

        await axios.post(
          `http://localhost:9090/api/visitors/image/upload/${visitorId}`,
          imgForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      alert("Delivery Visitor Added ✅");

      /* RESET */
      setStep(1);
      setMobileNumber("");
      setName("");
      setImageFile(null);
      setImagePreview(null);
      setCompanyId(null);
      setVehicleNumber("");
      setBuildingId("");
      setFloorId("");
      setFlatId("");

    } catch (err) {
      console.error(err);
      alert("Failed to add delivery visitor ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0b1d2d] via-[#102a44] to-[#0b1d2d] p-4 lg:ml-2">
      <div className="w-full max-w-sm">

        {/* STEP 1 : MOBILE */}
        {step === 1 && (
          <Card title="Mobile Number" icon={<Phone size={18} />}>
            <input
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              placeholder="10 digit mobile number"
              className="w-full p-3 border rounded-xl"
              autoFocus
            />
            <button
              disabled={mobileNumber.length !== 10}
              onClick={() => setStep(2)}
              className="mt-5 w-full py-3 rounded-xl bg-red-500 text-white"
            >
              Continue
            </button>
          </Card>
        )}

        {/* STEP 2 : NAME */}
        {step === 2 && (
          <Card title="Delivery Person Name" icon={<User size={18} />}>
            <Back onClick={() => setStep(1)} />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full p-3 border rounded-xl"
            />
            <button
              disabled={!name}
              onClick={() => setStep(3)}
              className="mt-5 w-full py-3 rounded-xl bg-red-500 text-white"
            >
              Continue
            </button>
          </Card>
        )}

        {step === 3 && (
          <Card title="Photo" icon={<Camera size={18} />}>
            <Back onClick={() => setStep(2)} />

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

            <button
              onClick={() => document.getElementById("cameraInput").click()}
              className="w-full py-3 border-2 border-dashed rounded-xl text-red-500 font-semibold"
            >
              Open Camera
            </button>

            {imagePreview && (
              <img src={imagePreview} className="mt-4 h-40 w-full object-cover rounded-xl" />
            )}

            <button
              disabled={!imageFile}
              onClick={() => setStep(4)}
              className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl"
            >
              Continue
            </button>
          </Card>
        )}

        {/* STEP 4 : COMPANY */}
      {step === 4 && (
      <Card title="Select Company" icon={<Building2 size={18} />}>
      <Back onClick={() => setStep(3)} />

    {/* SEARCH INPUT */}
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
      <input
        value={companySearch}
        onChange={e => setCompanySearch(e.target.value)}
        placeholder="Search/Add company"
        className="w-full pl-10 p-3 border rounded-xl"
      />
    </div>

       {/* COMPANY GRID */}
        <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
         {companies
          .filter(c =>
          c.name.toLowerCase().includes(companySearch.toLowerCase())
        )
        .map(c => (
          <button
            key={c.id}
            onClick={() => {
              setCompanyId(c.id);
              setStep(5);
            }}
            className="flex flex-col items-center p-2 border rounded-xl hover:bg-indigo-600 hover:text-white transition"
          >
            {c.logoUrl ? (
              <img
                src={`http://localhost:9090/api/companies/image/get/company/${c.id}`}
                alt={c.name}
                className="h-12 w-12 object-contain bg-white rounded"/>
            ) : (
              <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded text-xs text-gray-600">
                No Logo
              </div>
            )}
            <span className="mt-2 text-xs text-center font-medium">{c.name}</span>
          </button>
        ))}
         </div>
        </Card>
        )}


        {/* STEP 5 : VEHICLE */}
        {step === 5 && (
          <Card title="Vehicle Number" icon={<Truck size={18} />}>
            <Back onClick={() => setStep(4)} />
            <input
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="MH12 AB 1234"
              className="w-full p-3 border rounded-xl"
            />
            <button
              disabled={!vehicleNumber}
              onClick={() => setStep(6)}
              className="mt-5 w-full py-3 rounded-xl bg-red-500 text-white"
            >
              Continue
            </button>
          </Card>
        )}

        {/* STEP 6 : BUILDING */}
        {step === 6 && (
           <Card title="Select Building" icon={<Building2 size={18} />}>
              <Back onClick={() => setStep(5)} />
              <select value={buildingId} onChange={e => setBuildingId(e.target.value)} 
                className="w-full min-w-0 box-border p-3 border rounded-xl" >
                <option value="" className="">Select Building</option>
                {buildings.map(b => (
                   <option key={b.id} value={b.id}>
                     {b.name}
                   </option>
                ))}
              </select>
              <button disabled={!buildingId} onClick={() => setStep(7)} className="mt-5 w-full py-3 rounded-xl bg-red-500 text-white">
                Continue
              </button>
          </Card>
        )}

        {/* STEP 7 : FLOOR */}
        {step === 7 && (
          <Card title="Select Floor" icon={<Building2 size={18} />}>
            <Back onClick={() => setStep(6)} />
            <select value={floorId} onChange={e => setFloorId(e.target.value)}
              className="w-full p-3 border rounded-xl">
              <option value="">Select Floor</option>
              {floors.map(f => (
                 <option key={f.id} value={f.id}>
                   {f.floorNumber}
                 </option>
              ))}
            </select>
            <button
              disabled={!floorId}
              onClick={() => setStep(8)}
              className="mt-5 w-full py-3 rounded-xl bg-red-500 text-white">
              Continue
            </button>
         </Card>
       )}

       {/* STEP 8 : FLAT */}
       {step === 8 && (
          <Card title="Select Flat" icon={<Building2 size={18} />}>
            <Back onClick={() => setStep(7)} />
            <select
               value={flatId}
               onChange={e => setFlatId(e.target.value)}
               className="w-full p-3 border rounded-xl" >
               <option value="">Select Flat</option>
                {flats.map(f => (
                  <option key={f.id} value={f.id}>
                   {f.flatNumber}
                  </option>
               ))}
           </select>

           <button
            disabled={!flatId || loading}
            onClick={submitDelivery}
            className="mt-5 w-full py-3 rounded-xl bg-green-500 text-white flex justify-center gap-2" >
            <Check size={18} /> Submit Delivery
           </button>
         </Card>
       )}

      </div>
    </div>
  );
}
