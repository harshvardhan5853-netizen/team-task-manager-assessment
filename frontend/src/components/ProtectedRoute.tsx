import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export function ProtectedRoute() {
  return useAuthStore((s) => s.token) ? <Outlet /> : <Navigate to="/login" replace />;
}
