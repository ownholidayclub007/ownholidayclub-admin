import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
      {/* NAVBAR */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* PAGE BODY */}
      <div className="flex pt-22 flex-1">
        {/* SIDEBAR */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* MAIN CONTENT + FOOTER */}
        <div
          className={`
            flex flex-col flex-1 transition-all duration-300 min-w-0 overflow-hidden
            ${sidebarOpen ? "lg:ml-74" : "lg:ml-20"}
          `}
        >
          <main className="flex-1 px-3 sm:px-4 lg:px-4 pt-0">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
