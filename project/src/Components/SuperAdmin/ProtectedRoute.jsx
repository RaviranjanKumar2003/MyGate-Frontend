// src/Components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("userRole");

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Access granted
  return children;
};

export default ProtectedRoute;
