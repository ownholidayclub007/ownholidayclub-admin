// Auth utility helpers
import api from "../lib/api";

export const logout = async () => {
  try {
    // Call backend logout (optional but professional)
    await api.post("/api/cms/auth/logout");
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
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken")
  );
};

export const isAuthenticated = () => {
  return !!getToken();
};
