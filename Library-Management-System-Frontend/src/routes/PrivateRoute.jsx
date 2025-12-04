import React from "react";
import { Navigate } from "react-router-dom";

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  // Check role-based access
  if (role === "admin" && !["admin", "super_admin"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  if (role === "student" && user.role !== "user") {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;
