import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Eye,
  EyeOff,
  LogIn,
  Lock,
  User,
  Plane,
  Globe,
  Star,
  Shield,
  MapPin,
} from "lucide-react";
import api from "../lib/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ Check if already logged in
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // ✅ SweetAlert helper
  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#C8102E",
      background: "#f8f9fa",
      customClass: {
        title: "text-xl font-bold",
        popup: "rounded-sm",
        confirmButton: "py-2 px-5 text-base font-semibold",
      },
    });
  };

  // ✅ LOGIN — with backend integration
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      showAlert("warning", "Missing Fields", "Please fill in all fields!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/cms/auth/login", credentials);
      const { token, admin } = response.data;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("adminToken", token);
      storage.setItem("adminInfo", JSON.stringify(admin));
      
      if (rememberMe) localStorage.setItem("rememberMe", "true");

      await Swal.fire({
        icon: "success",
        title: "Login Successful!",
        html: `Welcome back, <span style="color: #2563EB; font-weight: bold; text-transform: capitalize;">${admin.username}</span>!`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Invalid username or password!";
      showAlert("error", "Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-[#C8102E]/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#F5A623]/5 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Main grid */}
      <div className="relative z-10 w-full max-w-7xl grid lg:grid-cols-2 gap-10 items-center">

        {/* ── LEFT SIDE ── */}
        <div className="hidden lg:block space-y-8">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-5 mb-8">
            <img
              src="/logo.png"
              alt="Own Holiday Club Logo"
              className="h-20 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {/* <div>
              <h1 className="text-4xl font-bold">
                <span className="text-[#C8102E]">Own </span>
                <span className="text-gray-900">Holiday Club</span>
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Travel &amp; Membership Management
              </p>
            </div> */}
          </div>

          {/* Feature cards */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Manage holiday packages, memberships, destinations, and bookings —
              all in one powerful platform.
            </p>

            <div className="space-y-4 pt-6">
              <FeatureCard
                icon={<Plane className="text-[#C8102E]" size={24} />}
                title="Holiday Packages"
                desc="Create and manage curated travel packages across destinations"
              />
              <FeatureCard
                icon={<MapPin className="text-[#F5A623]" size={24} />}
                title="Destinations"
                desc="Add and showcase popular holiday destinations worldwide"
              />
              <FeatureCard
                icon={<Star className="text-[#C8102E]" size={24} />}
                title="Membership Plans"
                desc="Manage club memberships, benefits, and member profiles"
              />
              <FeatureCard
                icon={<Shield className="text-[#F5A623]" size={24} />}
                title="Secure Access"
                desc="Protected with industry-standard encryption and authentication"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE — LOGIN FORM ── */}
        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg">
          <div className="text-center mb-8">
            {/* Mobile logo */}
            <div className="flex justify-center mb-4 lg:hidden">
              <img
                src="/logo.png"
                alt="Own Holiday Club"
                className="h-16 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Welcome Back!
            </h2>
            <p className="text-gray-600 text-lg">
              Sign in to access the holiday club dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* USERNAME */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 focus:outline-none focus:border-[#C8102E] transition-colors text-base"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-300 focus:outline-none focus:border-[#C8102E] transition-colors text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#C8102E] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="ml-3 text-base text-gray-600 cursor-pointer select-none"
              >
                Keep me logged in
              </label>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C8102E] hover:bg-[#a00d24] text-white font-bold py-4 px-6 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider text-base shadow-lg hover:shadow-xl mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>SIGN IN TO DASHBOARD</span>
                </>
              )}
            </button>

            {/* DEMO CREDENTIALS */}
            <div className="mt-6 p-5 bg-gray-50 border border-gray-200">
              <p className="text-sm text-center text-gray-700 font-bold mb-3">
                🔐 Demo Credentials
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base">
                <div className="bg-white px-4 py-2.5 border border-gray-300">
                  <span className="text-gray-600">Username: </span>
                  <span className="font-bold text-[#C8102E]">admin</span>
                </div>
                <div className="bg-white px-4 py-2.5 border border-gray-300">
                  <span className="text-gray-600">Password: </span>
                  <span className="font-bold text-[#C8102E]">admin123</span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
                Use these credentials for testing the admin panel
              </p>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
            © {new Date().getFullYear()} Own Holiday Club · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ Feature Card
const FeatureCard = ({ icon, title, desc }) => (
  <div className="flex items-center space-x-4 bg-white p-5 border-2 border-gray-200 hover:border-[#C8102E] transition-all duration-300">
    <div className="w-14 h-14 bg-[#C8102E]/10 rounded-sm flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="font-bold text-gray-800 text-lg">{title}</p>
      <p className="text-gray-600">{desc}</p>
    </div>
  </div>
);

export default AdminLogin;
