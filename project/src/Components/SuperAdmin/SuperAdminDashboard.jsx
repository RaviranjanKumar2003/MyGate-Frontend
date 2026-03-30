import React, { useState } from "react";
import Navebar from "../SuperAdmin/Navebar";
import Sidebar from "./Sidebar";
import AllSocieties from "./AllSocieties";
import BuildingContent from "./BuildingContent";
import CreateSociety from "./CreateSociety";
import SuperAdminNotice from "./SuperAdminNotice";
import SuperComplaint from "./SuperComplaint";
import SuperPayment from "./SuperPayment";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("society");
  const [selectedSociety, setSelectedSociety] = useState(null);

  return (
    <>
      <Navebar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gray-50">
        {/* SIDEBAR */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 lg:ml-80 mt-5">
          
          {/* ALL SOCIETIES */}
          {activeMenu === "society" && (
            <>
              {!selectedSociety ? (
                <AllSocieties onViewDetails={setSelectedSociety} />
              ) : (
                <BuildingContent
                  society={selectedSociety}
                  onBack={() => setSelectedSociety(null)}
                />
              )}
            </>
          )}

          {/* CREATE SOCIETY */}
          {activeMenu === "create-society" && (
              <CreateSociety onSuccess={() => setActiveMenu("society")} />
          )}

          {activeMenu === "notice" && (
              <SuperAdminNotice onSuccess={() => setActiveMenu("notice")} />
          )}

          {activeMenu === "complain" && (
              <SuperComplaint onSuccess={() => setActiveMenu("complain")} />
          )}

          {activeMenu === "superpayment" && (
              <SuperPayment onSuccess={() => setActiveMenu("superpayment")} />
          )}

        </div>
      </div>
    </>
  );
}

export default Dashboard;
