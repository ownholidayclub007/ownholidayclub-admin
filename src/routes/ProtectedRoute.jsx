import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isInfluencerAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ influencerOnly = false, children }) {
  const isInfluencer = isInfluencerAuthenticated();
  if (influencerOnly) {
    return isInfluencer ? children || <Outlet /> : <Navigate to="/login" replace />;
  }
  if (isInfluencer) return <Navigate to="/influencer-dashboard" replace />;
  return isAuthenticated() ? children || <Outlet /> : <Navigate to="/login" replace />;
}
