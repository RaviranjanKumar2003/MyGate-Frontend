import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Building2,
  LogOut,
} from "lucide-react";
import NotificationBell from "../NotificationBell";

export default function Topbar({
  isSidebarOpen,
  toggleSidebar,
  sidebarCollapsed,
}) {
  const [societyName, setSocietyName] = useState(
    localStorage.getItem("societyName") || "Society Admin"
  );

  const token = localStorage.getItem("jwtToken");

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  useEffect(() => {
    const fetchSocietyName = async () => {
      try {
        if (!token) return;

        const res = await fetch(
          `${BASE_URL}/society-admins/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data?.society?.name) {
          setSocietyName(data.society.name);
          localStorage.setItem(
            "societyName",
            data.society.name
          );
        }
      } catch (err) {
        console.error("Society fetch error", err);
      }
    };

    fetchSocietyName();
  }, [token]);

  const handleNotificationNavigate = (n) => {
    switch (n.type) {
      case "COMPLAINT":
        return `/society-admin/complaints/${n.referenceId}`;

      case "NOTICE":
        return `/society-admin/notices/${n.referenceId}`;

      default:
        return "/society-admin/notices";
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header
      className="
      sticky top-0 z-30
      bg-white/95
      backdrop-blur-xl
      border-b border-slate-200
      h-[72px]
      px-4 md:px-6
      "
    >
      <div className="h-full flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* MOBILE MENU */}
          <button
            onClick={toggleSidebar}
            className="
            lg:hidden
            h-10 w-10
            flex items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            hover:bg-slate-50
            transition-all duration-200
            "
          >
            {isSidebarOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>

          {/* TITLE SECTION */}
          <div className="flex items-center gap-3">

            <div
              className="
              hidden sm:flex
              h-11 w-11
              items-center justify-center
              rounded-xl
              bg-slate-100
              border border-slate-200
              "
            >
              <Building2
                size={18}
                className="text-slate-700"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">
                Society Management
              </p>

              <h2
                className="
                text-lg md:text-xl
                font-semibold
                text-slate-800
                tracking-tight
                "
              >
                {societyName}
              </h2>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* NOTIFICATION */}
          <div
            className="
            h-10 w-10
            flex items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            hover:bg-slate-50
            transition-all duration-200
            "
          >
            <NotificationBell
              onNavigate={handleNotificationNavigate}
            />
          </div>

          {/* STATUS */}
          <div
            className="
            hidden md:flex
            items-center gap-2
            px-3 py-2
            rounded-xl
            bg-emerald-50
            border border-emerald-100
            "
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold text-emerald-700">
              Active
            </span>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="
            flex items-center gap-2
            px-4 h-10
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-700
            hover:bg-red-50
            hover:border-red-200
            hover:text-red-600
            transition-all duration-200
            "
          >
            <LogOut size={16} />

            <span className="hidden sm:block text-sm font-medium">
              Logout
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}