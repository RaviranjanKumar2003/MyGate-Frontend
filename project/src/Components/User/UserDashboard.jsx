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
import CommunityChat from "./CommunityChat";
import SocietyBazaar from "./ECommerce/SocietyBazaar";

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeScreen, setActiveScreen] = useState("DASHBOARD");

  /* 🔔 NOTIFICATIONS */
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);

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

  /* ================= FETCH NOTIFICATIONS ================= */
  useEffect(() => {
    if (!USER_ID) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/user");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Notification fetch failed", err);
      }
    };

    fetchNotifications();
  }, [USER_ID]);

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ================= MARK AS READ ================= */
  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) {
        await api.put(`/notifications/${n.id}/read`);
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, read: true } : item
        )
      );

      setOpenNotif(false);

      // optional navigation
      if (n.type === "COMPLAINT") {
        setActiveScreen("COMPLAINTS");
      }
      if (n.type === "NOTICE") {
        setActiveScreen("NOTICE");
      }
      if (n.type === "PAYMENT" || n.type === "PAYMENT_REMINDER") {
        setActiveScreen("PAYMENTS");
      }
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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

          {/* 🔔 NOTIFICATIONS */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <Bell
                size={22}
                className="cursor-pointer"
                onClick={() => setOpenNotif(!openNotif)}
              />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {unreadCount}
                </span>
              )}

              {openNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div className="px-4 py-2 border-b font-semibold text-gray-700">
                    Notifications
                  </div>

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-3 border-b cursor-pointer
                          ${!n.read ? "bg-blue-50" : ""}
                          hover:bg-gray-100`}
                      >
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-gray-600">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-gray-500">
                      No notifications
                    </p>
                  )}
                </div>
              )}
            </div>

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