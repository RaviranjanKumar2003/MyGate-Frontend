import React, { useEffect, useState } from "react";
import { Bell, Menu, LogOut } from "lucide-react";
import api from "../../api/axios";

function StaffTopbar({ toggleSidebar }) {

  const [time, setTime] = useState(new Date());
  const [profile, setProfile] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);

  const STAFF_ID = localStorage.getItem("userId");

  const societyName =
    localStorage.getItem("societyName") || "Society Admin";

  /* ================= LIVE TIME ================= */

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    if (!STAFF_ID) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${STAFF_ID}`);
        setProfile(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        console.error("Topbar profile load failed");
      }
    };

    fetchProfile();
  }, [STAFF_ID]);

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = async () => {
    try {

      const res = await api.get("/notifications/user");

      setNotifications(res.data || []);

      const unread = (res.data || []).filter((n) => !n.read).length;

      setUnreadCount(unread);

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error("Notification fetch failed");
    }
  };

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);

  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ================= IMAGE ================= */

  const getProfileImage = (id) =>
    // eslint-disable-next-line react-hooks/purity
    `${api.defaults.baseURL}/users/image/get/user/${id}?t=${Date.now()}`;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b shadow-sm z-40 flex items-center justify-between px-4">

      {/* LEFT */}

      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

        <div className="leading-tight">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            {societyName}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            Security Panel
          </p>
        </div>
      </div>

      {/* CENTER */}

      <div className="hidden md:flex flex-col text-center">
        <span className="text-sm font-semibold text-gray-700">
          {time.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>

        <span className="text-xs text-gray-500">
          {time.toLocaleTimeString("en-IN")}
        </span>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-3 relative">

        {/* 🔔 Notification */}

        <button
          onClick={() => setOpenNotif(!openNotif)}
          className="relative p-2 rounded-md hover:bg-gray-100"
        >
          <Bell size={20} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}

        {openNotif && (
          <div className="absolute right-0 top-12 w-72 bg-white border rounded-lg shadow-lg z-50">

            <div className="p-3 border-b font-semibold text-sm">
              Notifications
            </div>

            <div className="max-h-64 overflow-y-auto">

              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 p-3">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-sm border-b hover:bg-gray-50 ${
                      !n.read ? "bg-gray-100" : ""
                    }`}
                  >
                    {n.message}
                  </div>
                ))
              )}

            </div>

          </div>
        )}

        {/* PROFILE */}

        {profile && (
          <div className="hidden sm:flex items-center gap-2">
            <img
              src={getProfileImage(profile.id)}
              onError={(e) =>
                (e.target.src = "/default-avatar.png")
              }
              className="h-9 w-9 rounded-full border object-cover"
              alt="profile"
            />

            <span className="text-sm font-medium text-gray-700">
              {profile.name}
            </span>
          </div>
        )}

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-md transition"
        >
          <LogOut size={18} />
          <span className="hidden sm:block">Logout</span>
        </button>

      </div>

    </header>
  );
}

export default StaffTopbar;