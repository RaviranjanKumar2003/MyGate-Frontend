import React, { useEffect, useRef, useState } from "react";
import { Menu, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import api from "../../api/axios";

/* ================= SCREENS ================= */
import Dash from "./UDash";
import UserVisitor from "./UserVisitor";
import Deliveries from "./Deliveries";
import Payments from "./UserPayments";
import UserComplaint from "./UserComplaint";
import UserNotice from "./UserNotice";
import MyQR from "./MyQR";
import CommunityChat from "./ChatSection/CommunityChat";
import SocietyBazaar from "./ECommerce/SocietyBazaar";
import NotificationBell from "../NotificationBell";

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeScreen, setActiveScreen] = useState("DASHBOARD");

  const navigate = useNavigate();

  const USER_ID = localStorage.getItem("userId");
  const SOCIETY_ID = localStorage.getItem("societyId");
  const SOCIETY_NAME = localStorage.getItem("societyName");

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* ================= FETCH USER ================= */
  useEffect(() => {
    if (!USER_ID || !SOCIETY_ID) return;

    api
      .get(`/users/society/${SOCIETY_ID}/user/${USER_ID}`)
      .then((res) => {
        const data = res.data;
        setUserProfile(data);

        localStorage.setItem("societyId", data.societyId);
        localStorage.setItem("societyName", data.societyName);
        localStorage.setItem("buildingId", data.buildingId);
        localStorage.setItem("buildingName", data.buildingName);
        localStorage.setItem("floorId", data.floorId);
        localStorage.setItem("floorNumber", data.floorNumber);
        localStorage.setItem("flatId", data.flatId);
        localStorage.setItem("flatNumber", data.flatNumber);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) handleLogout();
      });
  }, [USER_ID, SOCIETY_ID]);



  

  /* ================= SCREEN RENDER ================= */
  const renderScreen = () => {
    switch (activeScreen) {
      case "VISITORS":
        return <UserVisitor userProfile={userProfile} />;
      case "DELIVERIES":
        return <Deliveries userProfile={userProfile} />;
      case "PAYMENTS":
        return <Payments userProfile={userProfile} />;
      case "COMPLAINTS":
        return <UserComplaint userProfile={userProfile} />;
      case "NOTICE":
        return <UserNotice userProfile={userProfile} />;
      case "CommunityChat":
        return <CommunityChat userProfile={userProfile} />;
      case "SocietyBazaar":
        return <SocietyBazaar userProfile={userProfile} />;
      case "MY_QR":
        return <MyQR userProfile={userProfile} />;
      default:
        return <Dash userProfile={userProfile} />;
    }
  };

  /* ================= MENU ================= */
  const MENU_ITEMS = [
    { label: "Dashboard", key: "DASHBOARD" },
    { label: "Visitors", key: "VISITORS" },
    { label: "Deliveries", key: "DELIVERIES" },
    { label: "Payments", key: "PAYMENTS" },
    { label: "Complaint", key: "COMPLAINTS" },
    { label: "Notice", key: "NOTICE" },
    { label: "CommunityChat", key: "CommunityChat" },
    { label: "SocietyBazaar", key: "SocietyBazaar" },
    { label: "My QR", key: "MY_QR" }
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        userProfile={userProfile}
        menuItems={MENU_ITEMS}
        onLogout={handleLogout}
      />

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* ================= TOPBAR ================= */}
        <div className="flex items-center justify-between bg-[#0b2a35] text-white p-4 shadow">
  
  <div className="flex items-center gap-3">
    <Menu
      className="md:hidden cursor-pointer"
      onClick={() => setSidebarOpen(true)}
    />

    <div>
      <h3 className="font-semibold">
        {userProfile?.societyName || SOCIETY_NAME}
      </h3>
      <p className="text-xs opacity-80">
        Flat {userProfile?.flatNumber} • {userProfile?.normalUserType}
      </p>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-4">

    {/* 🔔 NOTIFICATION BELL */}
    <NotificationBell
      bg="dark"
      societyId={SOCIETY_ID}
      role="NORMAL_USER"
    />

    {/* LOGOUT */}
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
    >
      <LogOut size={16} />
      Logout
    </button>
  </div>
</div>

        {/* ================= CONTENT ================= */}
        <div className="flex-1 overflow-auto sm:p-4">{renderScreen()}</div>
      </div>
    </div>
  );
}

export default UserDashboard;