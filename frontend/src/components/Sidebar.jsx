import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { publicNavigation } from "./Header/publicNavigation";

const Sidebar = ({ open, onClose, user, onLogin, onRegister, onLogout }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    if (!open) {
      setExpandedItem(null);
    }
  }, [open]);

  const toggleDropdown = (itemTo) => {
    setExpandedItem((currentItem) => (currentItem === itemTo ? null : itemTo));
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin_active_item");
    localStorage.removeItem("giasu_active_item");
    localStorage.removeItem("phuhuynh_active_item");
    sessionStorage.removeItem("auth_session_active");
    onLogout?.();
    onClose();
  };

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-300 z-[999]",
          open ? "opacity-100 visible" : "opacity-0 invisible",
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[80%] max-w-sm bg-white z-[1000]",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img
              src="https://d1reana485161v.cloudfront.net/i/logo_findtutors_v3.svg"
              alt="logo"
              className="h-10 w-auto cursor-pointer"
            />
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* User info (if logged in) */}
        {user && (
          <div className="px-5 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1 px-5 py-5 font-medium">
          {publicNavigation.map((item) => {
            const isExpanded = expandedItem === item.to;

            if (item.dropdownItems?.length) {
              return (
                <div key={item.to} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "flex-1 rounded-lg px-3 py-3 transition-colors",
                          isActive || isExpanded
                            ? "bg-blue-50 text-blue-500"
                            : "text-gray-800 hover:bg-gray-50 hover:text-blue-500",
                        )
                      }
                    >
                      {item.label}
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.to)}
                      aria-expanded={isExpanded}
                      aria-label={`Mở menu ${item.label}`}
                      className={cn(
                        "rounded-lg px-3 py-3 transition-colors",
                        isExpanded
                          ? "bg-blue-50 text-blue-500"
                          : "text-gray-800 hover:bg-gray-50 hover:text-blue-500",
                      )}
                    >
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-300",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </button>
                  </div>

                  <div
                    className={cn(
                      "ml-4 flex flex-col gap-1 overflow-hidden border-l border-gray-200 pl-3 transition-all duration-300",
                      isExpanded
                        ? "max-h-40 opacity-100"
                        : "pointer-events-none max-h-0 opacity-0",
                    )}
                  >
                    {item.dropdownItems.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            "rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-blue-50 text-blue-500"
                              : "text-gray-600 hover:bg-gray-50 hover:text-blue-500",
                          )
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-3 transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-500"
                      : "text-gray-800 hover:bg-gray-50 hover:text-blue-500",
                  )
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Auth buttons */}
        <div className="px-5 pt-4 border-t border-gray-200">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors justify-center"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-4 py-3 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors justify-center"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onLogin?.();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors justify-center font-medium"
            >
              <LogIn size={18} />
              Đăng nhập
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
