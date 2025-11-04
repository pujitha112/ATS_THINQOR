import React, { useState, Fragment } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../auth/authSlice";

const baseClasses = "px-3 py-2 rounded-lg text-sm font-medium transition";
const activeClasses = "bg-indigo-600 text-white";
const idleClasses = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  const role = user?.role || "PUBLIC";

  // ✅ Hide full navbar on login/signup screen, but show center Login/Register
  const isAuthPage = location.pathname === "/" || location.pathname === "/signup";

  // Menu config
  const MENUS = {
    ADMIN: [
      { to: "/admin-dashboard", label: "Dashboard" },
      { to: "/users", label: "Users" },
      {to: "/clients", label:"Clients"},
      { to: "/requirements", label: "Requirements" },
      { to: "/candidates", label: "Candidates" },
      { to: "/applications", label: "Applications" },
      { to: "/interviews", label: "Interviews" },
      { to: "/offers", label: "Offers" },
      { to: "/reports", label: "Reports" },
      { to: "/settings", label: "Settings" },
      { to: "/create-requirement", label: "Create Requirement" },
    ],
    DELIVERY_MANAGER: [
      { to: "/dm-dashboard", label: "Dashboard" },
      { to: "/requirements", label: "Requirements" },
      { to: "/create-requirement", label: "Create Requirement" },
      { to: "/candidates", label: "Candidates" },
      { to: "/applications", label: "Applications" },
      { to: "/interviews", label: "Interviews" },
      { to: "/reports", label: "Reports" },
       // ✅ DM access
    ],
  };

  const menuItems = MENUS[role] || [];

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate("/"));
  };

  // ✅ Only show NavBar on dashboards
  if (isAuthPage) {
    return (
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl text-white flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-lg font-bold text-gray-900">Thinqor ATS</span>
          </div>

          {/* ✅ Center Login / Register only */}
          <div className="flex gap-4 absolute left-1/2 -translate-x-1/2">
            <NavLink to="/" className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : idleClasses}`}
            >
              Login
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : idleClasses}`}
            >
              Register
            </NavLink>
          </div>
        </div>
      </nav>
    );
  }

  // ✅ Normal navbar after login
  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/admin-dashboard")}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-lg font-bold text-gray-900">Thinqor ATS</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <NavLink key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${baseClasses} ${isActive ? activeClasses : idleClasses}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* ✅ Logout Only (remove right login/register) */}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
