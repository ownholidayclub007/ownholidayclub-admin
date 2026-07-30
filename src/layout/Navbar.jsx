import {
  Bell,
  Menu,
  X,
  LogOut,
  Key,
  BellRing,
  HelpCircle,
  Sun,
  Moon,
  Sunrise,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { logout } from "../utils/auth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Navbar({
  sidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTitle, setActiveTitle] = useState(null);
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({ username: "Admin", role: "..." });
  const [greeting, setGreeting] = useState({ text: "", icon: null });

  useEffect(() => {
    const storedInfo =
      localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setAdminData({
          username: parsed.username || "Admin",
          role: parsed.role || "Authorized Access",
        });
      } catch (e) {}
    }

    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting({
          text: "Good Morning",
          icon: <Sunrise size={20} className="text-amber-500" />,
        });
      } else if (hour >= 12 && hour < 17) {
        setGreeting({
          text: "Good Afternoon",
          icon: <Sun size={20} className="text-orange-500" />,
        });
      } else {
        setGreeting({
          text: "Good Evening",
          icon: <Moon size={20} className="text-indigo-400" />,
        });
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out from admin panel",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      await logout();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-22 bg-white backdrop-blur-lg border-b border-slate-200/60 z-50 shadow-sm">
      <div
        className={`flex items-center justify-between h-full px-4 sm:px-6 transition-all duration-[400ms] ${
          sidebarOpen ? "lg:pl-[300px]" : "lg:pl-22"
        }`}
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-slate-700" />
            ) : (
              <Menu size={20} className="text-slate-700" />
            )}
          </button>

          {/* Greeting card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden sm:flex items-center gap-3 bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-200/60 group transition-all duration-300 hover:bg-white hover:border-[#C8102E]/30 hover:shadow-[0_2px_10px_-3px_rgba(200,16,46,0.1)]"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm transition-all duration-500 group-hover:scale-110">
              {greeting.icon}
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-slate-500 tracking-tight">
                  {greeting.text},
                </span>
                <span className="text-[12px] font-bold text-[#C8102E] tracking-tight">
                  {adminData.username}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
                <span className="text-[9px] font-bold text-[#C8102E] uppercase tracking-widest">
                  {adminData.role}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4 relative">
          {/* Help */}
          <div className="relative">
            <button
              onClick={() => setActiveTitle(activeTitle === "help" ? null : "help")}
              className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-105"
            >
              <HelpCircle size={18} className="text-slate-600" />
            </button>
            {activeTitle === "help" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              >
                Help &amp; Support
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}
          </div>

          {/* Bell Reminder */}
          <div className="relative">
            <button
              onClick={() => setActiveTitle(activeTitle === "reminder" ? null : "reminder")}
              className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-105"
            >
              <BellRing size={18} className="text-slate-600" />
            </button>
            {activeTitle === "reminder" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              >
                Reminders
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setActiveTitle(activeTitle === "notify" ? null : "notify")}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-105"
            >
              <Bell size={18} className="text-slate-600" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-[#C8102E] to-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg"
              >
                3
              </motion.span>
            </button>
            {activeTitle === "notify" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              >
                Notifications
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}
          </div>

          {/* Avatar */}
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setActiveTitle(null);
            }}
            className="relative flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-all duration-200 hover:scale-105"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#C8102E] flex-shrink-0 shadow-md bg-white">
              <DotLottieReact
                src="https://lottie.host/a7b85873-a46c-41aa-975d-56dd4d4c0015/DibmXAuxEK.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%", transform: "scale(1.4)" }}
              />
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap absolute right-0 top-16 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Admin Panel</p>
                <p className="text-sm font-bold text-slate-800">{adminData.username}</p>
              </div>

              <button
                onClick={() => {
                  navigate("/change-password");
                  setProfileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <Key size={16} className="text-slate-600" />
                <span className="font-medium">Change Password</span>
              </button>

              <div className="border-t border-slate-200" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut size={16} />
                <span className="font-semibold">Logout</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
