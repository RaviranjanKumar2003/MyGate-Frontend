import React, { useEffect, useRef, useState } from "react";
import { FaBell, FaTrash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function NotificationBell({
  listUrl = "/notifications/user",
  unreadUrl = "/notifications/unread-count",
  markReadUrl = "/notifications",
  deleteUrl = "/notifications",
  onNavigate,
  bg = "light"
}) {
  const navigate = useNavigate();
  const ref = useRef();

  const token = localStorage.getItem("jwtToken");

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH NOTIFICATIONS ================= */
  const fetchNotifications = async () => {
    try {
      if (!token) return;

      setLoading(true);

      const res = await axios.get(`${BASE_URL}${listUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH UNREAD COUNT ================= */
  const fetchUnreadCount = async () => {
    try {
      if (!token) return;

      const res = await axios.get(`${BASE_URL}${unreadUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUnreadCount(res.data || 0);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= REFRESH ================= */
  const refresh = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  /* ================= MARK AS READ ================= */
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}${markReadUrl}/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      await fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const deleteNotification = async (id, e) => {
    e?.stopPropagation();

    try {
      await axios.delete(`${BASE_URL}${deleteUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));

      await fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CLICK ================= */
  const handleClick = async (n, e) => {
    e?.stopPropagation();

    if (!n.read) {
      await markAsRead(n.id);
    }

    setOpen(false);

    if (onNavigate) {
      const path = onNavigate(n);
      if (path) navigate(path);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    refresh();
  }, []);

  /* ================= OPEN REFRESH ================= */
  useEffect(() => {
    if (open) refresh();
  }, [open]);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>

      {/* 🔔 BELL */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl transition-all duration-300 cursor-pointer"
      >
        <FaBell
          className={`transition-all duration-300 ${
            unreadCount > 0
              ? "text-yellow-400 animate-pulse drop-shadow-[0_0_10px_gold]"
              : bg === "dark"
              ? "text-white"
              : "text-gray-700"
          }`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📩 DROPDOWN */}
      {open && (
        <div className="absolute -right-15 sm:-right-29 mt-4 w-80 bg-white rounded-lg shadow-xl z-50">

          {/* HEADER */}
          <div className="px-4 py-2 border-b font-semibold text-gray-700 sticky top-0 bg-white z-10">
            Notifications
          </div>

          {/* 🔥 SCROLL CONTAINER */}
          <div className="max-h-96 overflow-y-auto">

            {loading ? (
              <p className="p-4 text-center text-gray-500">Loading...</p>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleClick(n, e)}
                  className={`px-4 py-3 border-b last:border-b-0 cursor-pointer flex justify-between items-start
                  ${!n.read ? "bg-blue-50" : ""}
                  hover:bg-gray-100`}
                >
                  {/* LEFT */}
                  <div>
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

                  {/* DELETE */}
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">
                No notifications
              </p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;