// Auth utility helpers
import api from "../lib/api";

export const logout = async () => {
  const isAdminSession = Boolean(
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken"),
  );
  try {
    if (isAdminSession) await api.post("/api/cms/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.clear(); // Clear everything for security
    sessionStorage.clear();
    window.location.href = "/login";
  }
};

export const getToken = () => {
  return (
    localStorage.getItem("influencerToken") ||
    sessionStorage.getItem("influencerToken") ||
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken")
  );
};

export const isAuthenticated = () =>
  Boolean(localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken"));

export const isInfluencerAuthenticated = () =>
  Boolean(
    localStorage.getItem("influencerToken") ||
    sessionStorage.getItem("influencerToken"),
  );
