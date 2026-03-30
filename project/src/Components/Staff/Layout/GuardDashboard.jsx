import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  KeyRound,
  Repeat,
  User,
  Bell,
  Users,
  Bike,
  Car,
  MoreVertical,
  Plus
} from "lucide-react";
import ScreenRenderer from "../ScreenRenderer";
import ThreeDot from "../Screens/ThreeDot";




const SOCIETY_ID = localStorage.getItem("societyId");
const STAFF_ID = localStorage.getItem("userId");

function GuardDashboard({ activeTab, setActiveTab}) {
  const [visitorCount, setVisitorCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);
  const [freqCount, setFreqCount] = useState(0);
  const [showThreeDot, setShowThreeDot] = useState(false);

  /* ================= VISITOR COUNT ================= */
  useEffect(() => {
    if (!SOCIETY_ID) return;

    // eslint-disable-next-line react-hooks/immutability
    fetchVisitorCount();
    // eslint-disable-next-line react-hooks/immutability
    fetchNoticeCount();
    // eslint-disable-next-line react-hooks/immutability
    fetchFreqCount();
  }, []);

  const fetchVisitorCount = async () => {
    try {
      const [pendingRes, inRes] = await Promise.all([
        axios.get(
          `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/status/PENDING`
        ),
        axios.get(
          `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/status/IN`
        )
      ]);

      const safeLength = (res) =>
        Array.isArray(res?.data?.data)
          ? res.data.data.length
          : Array.isArray(res?.data)
          ? res.data.length
          : 0;

      const pendingCount = safeLength(pendingRes);
      const inCount = safeLength(inRes);

      setVisitorCount(pendingCount + inCount);
    } catch (err) {
      console.error("Visitor count fetch failed", err);
      setVisitorCount(0);
    }
  };

  /* ================= NOTICE COUNT ================= */
  const fetchNoticeCount = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9090/api/notices/society/${SOCIETY_ID}/staff/${STAFF_ID}`
      );
      setNoticeCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error("Notice count fetch failed", err);
      setNoticeCount(0);
    }
  };

  /* ================= FREQUENT VISITOR COUNT ================= */
const fetchFreqCount = async () => {
  try {
    const res = await axios.get(
      `http://localhost:9090/api/visitors/society/${SOCIETY_ID}/visitorType/FREQUENT`
    );

    const count = Array.isArray(res?.data?.data)
      ? res.data.data.length
      : Array.isArray(res?.data)
      ? res.data.length
      : 0;

    setFreqCount(count);
  } catch (err) {
    console.error("Frequent visitor count fetch failed", err);
    setFreqCount(0);
  }
};

  return (
    <div className="h-screen bg-[#0b1d2d] text-white flex flex-col">

      {/* ================= TOP BAR ================= */}
      <div className="bg-red-600 flex items-center justify-between px-3 py-3 shadow-md">
        <div className="flex space-x-6">
          <Tab
            icon={<KeyRound />}
            label="ENTER CODE"
            tab="ENTER_CODE"
            {...{ activeTab, setActiveTab }}
          />

          <Tab
            icon={
               <div className="relative">
                 <Repeat />
                 {freqCount > 0 && (
                   <span className="absolute -top-2 -right-2 text-[10px] bg-blue-400 text-black font-bold px-1.5 rounded-full">
                      {freqCount}
                   </span>
                 )}
               </div>
             }
            label="FREQ"
            tab="FREQ_VISITOR"
         {...{ activeTab, setActiveTab }}/>

          <Tab
            icon={
              <div className="relative">
                <User />
                {visitorCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] bg-yellow-400 text-black font-bold px-1.5 rounded-full">
                    {visitorCount}
                  </span>
                )}
              </div>
            }
            label="VISITOR"
            tab="VISITOR"
            {...{ activeTab, setActiveTab }}
          />

          <Tab
            icon={
              <div className="relative">
                <Bell />
                {noticeCount > 0 && ( // ✅ Display notice count
                  <span className="absolute -top-2 -right-2 text-[10px] bg-green-400 text-black font-bold px-1.5 rounded-full">
                    {noticeCount}
                  </span>
                )}
              </div>
            }
            label="NOTICE"
            tab="NOTICE"
            {...{ activeTab, setActiveTab }}
          />
        </div>

        <button
          onClick={() => setShowThreeDot(true)}
          className="mb-2 rounded-full hover:bg-red-500 transition">
         <MoreVertical size={30}/>
        </button>

      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-y-auto bg-gray-100 text-black">
        <ScreenRenderer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="bg-black/40 py-3 flex justify-around items-center">
        <Bottom
          label="GUEST"
          tab="GUEST"
          icon={<Users />}
          {...{ activeTab, setActiveTab }}
        />

        <Bottom
          label="DELIVERY"
          tab="DELIVERY"
          icon={<Bike />}
          {...{ activeTab, setActiveTab }}
        />

        <Bottom
          label="CAB"
          tab="CAB"
          icon={<Car />}
          {...{ activeTab, setActiveTab }}
        />

        <Bottom
          label="MORE"
          tab="MORE"
          icon={<Plus />}
          {...{ activeTab, setActiveTab }}
        />
      </div>
      {showThreeDot && (
       <ThreeDot onClose={() => setShowThreeDot(false)} />
      )}

    </div>
  );
}

export default GuardDashboard;

/* ================= TAB COMPONENT ================= */

const Tab = ({ icon, label, tab, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`relative flex flex-col items-center text-xs font-semibold px-2 py-1 rounded hover:bg-red-500 transition ${
      activeTab === tab ? "text-white" : "text-white/70"
    }`}
  >
    <div className="mb-1">{icon}</div>
    {label}
  </button>
);

/* ================= BOTTOM COMPONENT ================= */

const Bottom = ({ icon, label, tab, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`flex flex-col items-center text-xs font-medium p-2 rounded hover:bg-white/10 transition ${
      activeTab === tab ? "text-white" : "text-white/60"
    }`}
  >
    <div className="mb-1">{icon}</div>
    {label}
  </button>
);
