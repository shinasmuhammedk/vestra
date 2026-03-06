import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth();

  if (!user) {
    toast.warn("Please login first", { toastId: "auth" });
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
