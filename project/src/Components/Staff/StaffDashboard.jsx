import React, { useState, useEffect } from "react";
import GuardDashboard from "./Layout/GuardDashboard";
import StaffSidebar from "./Layout/StaffSidebar";
import ScreenRenderer from "./ScreenRenderer";

function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("ENTER_CODE");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* 🔥 LISTENER FOR ThreeDot / Sidebar TAB CHANGE */
  useEffect(() => {
    const handler = () => {
      const tab = localStorage.getItem("staffTab");
      if (tab) {
        setActiveTab(tab);
        localStorage.removeItem("staffTab"); // optional but clean
      }
    };

    window.addEventListener("staff-tab-change", handler);
    return () => window.removeEventListener("staff-tab-change", handler);
  }, []);

  return (
    <div className="h-screen w-screen">

      {/* MOBILE */}
      <div className="lg:hidden">
        <GuardDashboard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSidebar={() => setSidebarOpen(true)}
        />

        <StaffSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex h-screen">
        <StaffSidebar
          open
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 bg-gray-100 overflow-auto">
          <ScreenRenderer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setSidebarOpen={setSidebarOpen}
          />
        </main>
      </div>

    </div>
  );
}

export default StaffDashboard;
