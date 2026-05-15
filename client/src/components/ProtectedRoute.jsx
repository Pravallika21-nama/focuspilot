import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, authChecking } = useAuth();
  if (authChecking) {
    return <div className="grid min-h-screen place-items-center text-slate-300">Checking secure session...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
