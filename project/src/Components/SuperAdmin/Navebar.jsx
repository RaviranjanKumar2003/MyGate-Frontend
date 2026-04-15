import React from "react";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import NotificationBell from "../NotificationBell";

function Navebar({ onMenuClick }) {
  const navigate = useNavigate();

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full h-15
      bg-linear-to-r from-[#1e3c72] to-[#2a5298]
      z-50 flex justify-between items-center px-5 shadow-lg"
    >
      {/* LEFT TITLE */}
      <h1 className="text-white text-lg font-bold">
        Super Admin Dashboard
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* 🔔 NOTIFICATION (Reusable Component) */}
        <NotificationBell
          bg="dark"
          onNavigate={(n) => {
            if (n.type === "COMPLAINT" && n.referenceId) {
              return `/super-admin/complaints/${n.referenceId}`;
            }
          }}
        />

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