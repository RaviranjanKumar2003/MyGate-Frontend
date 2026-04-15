import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import NotificationBell from "../NotificationBell";

export default function Topbar({ isSidebarOpen, toggleSidebar }) {
  const [societyName, setSocietyName] = useState(
    localStorage.getItem("societyName") || "Society Admin"
  );

  const token = localStorage.getItem("jwtToken");

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  /* ================= SOCIETY NAME ================= */
  useEffect(() => {
    const fetchSocietyName = async () => {
      try {
        if (!token) return;

        const res = await fetch(`${BASE_URL}/society-admins/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data?.society?.name) {
          setSocietyName(data.society.name);
          localStorage.setItem("societyName", data.society.name);
        }
      } catch (err) {
        console.error("Society fetch error", err);
      }
    };

    fetchSocietyName();
  }, [token]);

  /* ================= NAVIGATION LOGIC ================= */
  const handleNotificationNavigate = (n) => {
    // 🔥 smart routing based on type
    switch (n.type) {
      case "COMPLAINT":
        return `/society-admin/complaints/${n.referenceId}`;

      case "NOTICE":
        return `/society-admin/notices/${n.referenceId}`;

      default:
        return "/society-admin/notices";
    }
  };

  return (
    <div className="flex justify-between items-center bg-white shadow p-4 lg:m-3">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <h2 className="text-xl font-bold text-gray-800">
          {societyName}
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* 🔔 NOTIFICATION */}
        <NotificationBell
          onNavigate={handleNotificationNavigate}
        />

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}