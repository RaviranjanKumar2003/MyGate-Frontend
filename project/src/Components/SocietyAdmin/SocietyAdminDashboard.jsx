// import React, { useState } from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./SocietySidebar";
// import Topbar from "./Topbar";

// function SocietyAdminDashboard() {
//   const adminName = localStorage.getItem("userName") || "Society Admin";

//   /* ================= SIDEBAR STATE ================= */
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
      
//       {/* ================= SIDEBAR ================= */}
//       <Sidebar
//         open={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//       />

//       {/* ================= MAIN CONTENT ================= */}
//       <div className="flex flex-col flex-1 lg:ml-64">

//         {/* TOPBAR */}
//         <Topbar
//           adminName={adminName}
//           isSidebarOpen={isSidebarOpen}
//           toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//         />

//         {/* PAGE CONTENT (IMPORTANT) */}
//         <main className="flex-1 p-6">
//           <Outlet />
//         </main>

//       </div>
//     </div>
//   );
// }

// export default SocietyAdminDashboard;




import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SocietySidebar";
import Topbar from "./Topbar";

function SocietyAdminDashboard() {
  const adminName =
    localStorage.getItem("userName") || "Society Admin";

  /* MOBILE SIDEBAR */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* DESKTOP COLLAPSE */
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* SIDEBAR */}
      <Sidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* MAIN WRAPPER */}
      <div
        className={`
          transition-all duration-300
          ${
            sidebarCollapsed
              ? "lg:ml-20"
              : "lg:ml-72"
          }
        `}
      >
        {/* TOPBAR */}
        <Topbar
          adminName={adminName}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() =>
            setIsSidebarOpen(!isSidebarOpen)
          }
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* PAGE CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SocietyAdminDashboard;
