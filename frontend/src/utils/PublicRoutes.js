import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const PublicRoutes = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem("access");
  return isAuthenticated && token ? <Navigate to="/dashboard" /> : <Outlet />;
};
export default PublicRoutes;
