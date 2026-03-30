
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// AUTH
import Login from "./Components/SuperAdmin/Login";
import Register from "./Components/SuperAdmin/Register";
import ProtectedRoute from "./Components/SuperAdmin/ProtectedRoute";

// DASHBOARD LAYOUTS
import SuperAdminDashboard from "./Components/SuperAdmin/SuperAdminDashboard";
import SocietyAdminDashboard from "./Components/SocietyAdmin/SocietyAdminDashboard";
import StaffDashboard from "./Components/Staff/StaffDashboard";
import UserDashboard from "./Components/User/UserDashboard";
import GuardDashboard from "./Components/Staff/Layout/GuardDashboard";

// SOCIETY ADMIN PAGES
import Overview from "./Components/SocietyAdmin/Overview";
import Notices from "./Components/SocietyAdmin/Notices";
import Payments from "./Components/SocietyAdmin/SocietyPayments";
import FlatsTable from "./Components/SocietyAdmin/FlatsTable";
import Complaints from "./Components/SocietyAdmin/SocietyComplaints";
import SASettings from "./Components/SocietyAdmin/SASettings";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const ROLE_DASHBOARD_MAP = {
    SUPER_ADMIN: "/super-admin/dashboard",
    SOCIETY_ADMIN: "/society-admin/dashboard",
    STAFF: "/staff/dashboard",
    NORMAL_USER: "/user/dashboard",
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={
            isLoggedIn && userRole
              ? <Navigate to={ROLE_DASHBOARD_MAP[userRole]} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* SUPER ADMIN */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* SOCIETY ADMIN (NESTED ROUTES) */}
        <Route
          path="/society-admin"
          element={
            <ProtectedRoute allowedRoles={["SOCIETY_ADMIN"]}>
              <SocietyAdminDashboard />
            </ProtectedRoute>
          }>
          <Route index element={<Overview />} />
          <Route path="dashboard" element={<Overview />} />
          <Route path="notices" element={<Notices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="flatstable" element={<FlatsTable />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="settings" element={<SASettings />} />
        </Route>

        {/* STAFF */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
               <StaffDashboard />
            </ProtectedRoute>
          }>
       <Route index element={<GuardDashboard />} />
       </Route>



        {/* USER */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["NORMAL_USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
