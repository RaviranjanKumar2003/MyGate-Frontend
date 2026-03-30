import React, { useState, useRef, useEffect } from "react";
import { Bell, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CLICKED_KEY = "clickedNotificationIds";

export default function Topbar({ isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const notifRef = useRef(null);

  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [societyName, setSocietyName] = useState(
    localStorage.getItem("societyName") || "Society Admin"
  );

  const token = localStorage.getItem("jwtToken");

  const clickedIds =
    JSON.parse(localStorage.getItem(CLICKED_KEY)) || [];

  const unreadCount = notifications.length;

  // ================= FETCH SOCIETY NAME =================
  useEffect(() => {
    const fetchSocietyName = async () => {
      try {
        if (!token) return;

        const res = await fetch(
          `http://localhost:9090/api/society-admins/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        const name = data?.society?.name;

        if (name) {
          setSocietyName(name);
          localStorage.setItem("societyName", name);
        }
      } catch (err) {
        console.error("Failed to fetch society name", err);
      }
    };

    fetchSocietyName();
  }, [token]);

  // ================= FETCH NOTIFICATIONS (🔔 FIXED) =================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!token) return;

        const res = await axios.get(
          "http://localhost:9090/api/notifications/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 🔔 sirf unread / unclicked notifications
        const filtered = res.data.filter(
          (n) => !clickedIds.includes(n.id)
        );

        setNotifications(filtered);
      } catch (err) {
        console.error("Notification fetch failed", err);
      }
    };

    fetchNotifications();
  }, [token]);

  // ================= CLICK NOTIFICATION =================
  const handleNotificationClick = (notification) => {
    const updatedClicked = [...clickedIds, notification.id];
    localStorage.setItem(
      CLICKED_KEY,
      JSON.stringify(updatedClicked)
    );

    // bell se remove
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notification.id)
    );

    setOpenNotifications(false);

    // Notices page pe redirect
    navigate("/society-admin/notices", {
      state: { noticeId: notification.referenceId },
    });
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ================= CLOSE ON OUTSIDE CLICK =================
  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="flex justify-between items-center bg-white shadow p-4 lg:m-3">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700 cursor-pointer"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <h2 className="text-xl font-bold text-gray-800">
          {societyName}
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* 🔔 NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotifications(!openNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <Bell size={20} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl z-50">
              <div className="px-4 py-2 border-b font-semibold text-gray-700">
                Notifications
              </div>

              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">
                  No new notifications
                </p>
              )}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
