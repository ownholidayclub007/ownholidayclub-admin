import { ChevronDown, X, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { menuItems } from "../data/menuItems";
import { NavLink, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../utils/auth";

// ─── OHC Brand Theme ──────────────────────────────────────────────────────────
const DEFAULT_THEME = {
  bgColor: "#ffffff",
  iconColor: "#C8102E",
  textColor: "#1a1a2e",
  hoverColor: "#FFF5F5",
  activeColor: "#FFFBEB",
  toggleColor: "#C8102E",
  headingColor: "#021A54", // ← Section heading color — change karo yahan se
};

const BORDER_COLOR = "#F5C6CC";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [theme] = useState(DEFAULT_THEME);

  /* ── Auto-open dropdown for current route ────────────────────────────────── */
  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.type === "dropdown" &&
        item.children?.some((c) => location.pathname.startsWith(c.path))
      ) {
        setOpenDropdown(item.label);
      }
    });
  }, [location.pathname]);

  /* ── Logout ──────────────────────────────────────────────────────────────── */
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

  const cssVars = {
    "--sb-bg": theme.bgColor,
    "--sb-icon": theme.iconColor,
    "--sb-text": theme.textColor,
    "--sb-hover": theme.hoverColor,
    "--sb-active": theme.activeColor,
    "--sb-toggle": theme.toggleColor,
    "--sb-border": BORDER_COLOR,
    "--sb-heading": theme.headingColor,
  };

  return (
    <>
      <style>{`
        #ohc-sidebar {
          background-color: var(--sb-bg) !important;
          border-color: var(--sb-border) !important;
        }
        #ohc-sidebar .sb-header {
          border-color: var(--sb-border) !important;
          background: #ffffff !important;
        }
        #ohc-sidebar .sb-footer {
          background-color: var(--sb-bg) !important;
          border-color: var(--sb-border) !important;
        }
        #ohc-sidebar .sb-heading {
          color: var(--sb-heading) !important;
        }
        #ohc-sidebar .sb-icon {
          color: var(--sb-icon) !important;
        }
        #ohc-sidebar .sb-label {
          color: var(--sb-text) !important;
        }
        #ohc-sidebar .sb-chevron {
          color: var(--sb-text) !important;
        }
        #ohc-sidebar .sb-item:hover,
        #ohc-sidebar .sb-dropdown-btn:hover {
          background-color: var(--sb-hover) !important;
        }
        #ohc-sidebar .sb-item.active {
          background-color: #FFFBEB !important;
          border-color: #C8102E !important;
        }
        #ohc-sidebar .sb-sub-item:hover {
          background-color: var(--sb-hover) !important;
        }
        #ohc-sidebar .sb-sub-item.active {
          background-color: #FFFBEB !important;
          color: #C8102E !important;
        }
        #ohc-sidebar .sb-sub-border {
          border-color: var(--sb-border) !important;
        }
        #ohc-sidebar .sb-toggle-btn {
          background-color: var(--sb-toggle) !important;
        }
        #ohc-sidebar .sb-close-btn:hover {
          background-color: var(--sb-hover) !important;
        }
        #ohc-sidebar .sb-close-btn {
          color: #FF8C00 !important;
          background-color: var(--sb-hover) !important;
        }
      `}</style>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="ohc-sidebar"
        style={cssVars}
        className={`fixed top-0 left-0 h-screen border-r-4
          shadow-xl z-50 transition-all duration-300
          ${sidebarOpen ? "w-75" : "w-20 -translate-x-full lg:translate-x-0"}
          ${mobileMenuOpen ? "translate-x-0" : ""}`}
      >
        {/* HEADER */}
        <div className="sb-header relative p-6 border-b flex items-center justify-center">
          <div className="flex justify-center w-full pr-4">
            <img
              src="/logo.png"
              className="h-10 w-auto object-contain max-w-full"
              alt="OHC Logo"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
              }}
            />
            <div
              className="hidden items-center justify-center h-10 w-10 bg-[#C8102E] text-white font-bold text-lg rounded-lg"
            >
              OHC
            </div>
          </div>

          {sidebarOpen && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                setMobileMenuOpen(false);
              }}
              className="sb-close-btn absolute right-4 top-4 p-2 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* OPEN BUTTON */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="sb-toggle-btn mx-4 mt-4 p-2 rounded-lg text-white"
          >
            <Menu size={18} />
          </button>
        )}

        {/* MENU */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto sidebar-scroll px-3 pt-0 pb-3 space-y-2 text-[13px]">
          {menuItems.map((item, index) => {
            /* ===== HEADING ===== */
            if (item.type === "heading") {
              return (
                sidebarOpen && (
                  <p
                    key={index}
                    className={`sb-heading px-3 ${index === 0 ? "mt-2" : "mt-5"} mb-2 text-[11px] font-semibold uppercase`}
                  >
                    {item.label}
                  </p>
                )
              );
            }

            /* ===== NORMAL ITEM ===== */
            if (item.type === "item") {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `sb-item flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent
                    ${isActive ? "active" : ""}
                    ${!sidebarOpen && "justify-center"}`
                  }
                >
                  <Icon size={16} className="sb-icon" />
                  {sidebarOpen && (
                    <span className="sb-label whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            }

            /* ===== DROPDOWN ===== */
            if (item.type === "dropdown") {
              const Icon = item.icon;
              const isOpen = openDropdown === item.label;

              return (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      sidebarOpen && setOpenDropdown(isOpen ? null : item.label)
                    }
                    className={`sb-dropdown-btn w-full flex items-center justify-between px-3 py-2 rounded-xl
                      ${!sidebarOpen && "justify-center"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="sb-icon" />
                      {sidebarOpen && (
                        <span className="sb-label whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {sidebarOpen && (
                      <ChevronDown
                        size={14}
                        className={`sb-chevron transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="sb-sub-border ml-5 mt-1 space-y-1 border-l pl-3 py-1">
                        {item.children.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `sb-sub-item block px-3 py-1.5 rounded-lg sb-label transition-colors
                              ${isActive ? "active font-bold" : ""}`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* FOOTER */}
        <div className="sb-footer absolute bottom-0 w-full p-2 border-t">
          {sidebarOpen && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
              <span className="text-[10px] text-gray-500">
                v1.0.0 • Own Holiday Club
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
