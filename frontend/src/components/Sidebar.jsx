import { cn } from "@/lib/utils";
import React from "react";
import NavItem from "./Header/NavItem";
import { LogIn, UserPlus, LogOut, User, LayoutDashboard, X } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ open, onClose, user, onLogin, onRegister, onLogout }) => {
  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-300 z-40",
          open ? "opacity-100 visible" : "opacity-0 invisible",
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[80%] max-w-sm bg-white z-50",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
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
                <p className="text-xs text-gray-500 capitalize">
                  {user.role === 'phu_huynh' ? 'Phụ huynh' : user.role === 'gia_su' ? 'Gia sư' : user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-4 font-medium py-5">
          <NavItem to={"/"} onClick={onClose}>
            Trang chủ
          </NavItem>
          <NavItem to={"/dich-vu-gia-su"} onClick={onClose} hasDropdown>
            Dịch vụ gia sư
          </NavItem>
          <NavItem to={"/hoc-phi-gia-su"} onClick={onClose} hasDropdown>
            Học phí gia sư
          </NavItem>
          <NavItem to={"/lop-hien-co"} onClick={onClose} hasDropdown>
            Lớp hiện có cần gia sư
          </NavItem>
          <NavItem to={"/lien-he"} onClick={onClose} hasDropdown>
            Liên hệ
          </NavItem>
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
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
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
