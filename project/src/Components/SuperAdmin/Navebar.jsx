import React from "react";
import {
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  ShieldCheck,
} from "lucide-react";
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
      className="
      fixed top-0 left-0  w-full lg:w-[81%] h-16
      bg-slate-950/90
      backdrop-blur-xl
      border-b border-white/10
      z-50
      px-6
      flex items-center justify-between
      shadow-[0_8px_30px_rgba(0,0,0,0.35)]
      lg:ml-72
      "
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="
          lg:hidden
          h-10 w-10
          rounded-xl
          bg-white/5
          border border-white/10
          text-white
          flex items-center justify-center
          hover:bg-white/10
          transition-all
          "
        >
          <FaBars size={18} />
        </button>

        {/* LOGO + TITLE */}
        <div className="flex items-center gap-3">

          <div
            className="
            h-11 w-11
            rounded-2xl
            bg-gradient-to-br
            from-cyan-500
            via-blue-500
            to-indigo-600
            flex items-center justify-center
            shadow-lg shadow-cyan-500/30
            "
          >
            <ShieldCheck
              size={22}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-white font-bold text-lg leading-none">
              Super Admin
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Society Management System
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        {/* Notification */}
        <div
          className="
          bg-white/5
          border border-white/10
          rounded-xl
          px-3 py-2
          hover:bg-white/10
          transition-all
          "
        >
          <NotificationBell
            bg="dark"
            onNavigate={(n) => {
              if (
                n.type === "COMPLAINT" &&
                n.referenceId
              ) {
                return `/super-admin/complaints/${n.referenceId}`;
              }
            }}
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
          hidden lg:flex
          items-center gap-2
          px-4 py-2.5
          rounded-xl

          bg-gradient-to-r
          from-red-500
          to-red-600

          text-white
          font-medium

          hover:scale-105
          hover:shadow-lg
          hover:shadow-red-500/30

          transition-all duration-300
          "
        >
          <FaSignOutAlt />
          Logout
        </button>

        {/* Mobile Logout */}
        <button
          onClick={handleLogout}
          className="
          lg:hidden

          h-10 w-10
          rounded-xl

          bg-red-500/20
          border border-red-500/30

          text-red-400

          flex items-center justify-center

          hover:bg-red-500/30
          transition-all
          "
        >
          <FaSignOutAlt />
        </button>

      </div>
    </nav>
  );
}

export default Navebar;