import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Navebar({ onMenuClick }) {
  const navigate = useNavigate();
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("jwtToken");

  /* ================= FETCH NOTIFICATIONS ================= */
  const fetchNotifications = async () => {
    try {
      if (!token) return;

      setLoading(true);
      const res = await axios.get(
        "http://localhost:9090/api/notifications/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("NOTIFICATIONS RESPONSE 👉", res.data);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Notification fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ================= MARK AS READ + NAVIGATE ================= */
  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) {
        await axios.put(
          `http://localhost:9090/api/notifications/${n.id}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // update UI instantly
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, read: true } : item
        )
      );

      setOpenNotif(false);

      // 🔗 navigate based on type
      if (n.type === "COMPLAINT" && n.referenceId) {
        navigate(`/super-admin/complaints/${n.referenceId}`);
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="fixed top-0 left-0 w-full h-15
      bg-linear-to-r from-[#1e3c72] to-[#2a5298]
      z-50 flex justify-between items-center px-5 shadow-lg"
    >
      <h1 className="text-white text-lg font-bold">
        Super Admin Dashboard
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        {/* 🔔 NOTIFICATION BELL */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotif(!openNotif)}
            className="relative text-white text-xl"
          >
            <FaBell />

            {unreadCount > 0 && (
              <span
                className="absolute -top-2 -right-2
                bg-red-500 text-white text-xs
                w-5 h-5 flex items-center justify-center rounded-full"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {openNotif && (
            <div
              className="absolute right-0 mt-3 w-80
              bg-white rounded-lg shadow-xl z-50"
            >
              <div className="px-4 py-2 border-b font-semibold text-gray-700">
                Notifications
              </div>

              {loading ? (
                <p className="p-4 text-center text-gray-500">
                  Loading...
                </p>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 border-b last:border-b-0
                    cursor-pointer transition
                    ${!n.read ? "bg-blue-50" : ""}
                    hover:bg-gray-100`}
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {n.message}
                    </p>
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

        {/* LOGOUT */}
        <ul className="hidden lg:flex items-center gap-6">
          <li
            onClick={handleLogout}
            className="flex items-center gap-2
            text-white text-lg font-medium
            cursor-pointer px-4 py-2 rounded-md
            hover:bg-white/20 transition"
          >
            <FaSignOutAlt />
            Logout
          </li>
        </ul>

        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white text-2xl"
        >
          <FaBars />
        </button>
      </div>
    </nav>
  );
}

export default Navebar;