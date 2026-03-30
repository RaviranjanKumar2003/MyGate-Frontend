import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SocietySidebar";
import Topbar from "./Topbar";

function SocietyAdminDashboard() {
  const adminName = localStorage.getItem("userName") || "Society Admin";

  /* ================= SIDEBAR STATE ================= */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* ================= SIDEBAR ================= */}
      <Sidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-col flex-1 lg:ml-64">

        {/* TOPBAR */}
        <Topbar
          adminName={adminName}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* PAGE CONTENT (IMPORTANT) */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default SocietyAdminDashboard;
