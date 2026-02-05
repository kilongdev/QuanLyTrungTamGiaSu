import React, { useState } from "react";
import NavItem from "./NavItem";
import { Menu, X, LogIn, UserPlus, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "../Sidebar";
import { Link } from "react-router-dom";

const Header = ({ user, onLogin, onRegister, onLogout }) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white">
      <div className="flex items-center justify-between h-30 px-10 text-md bg-white">
        <img
          src="https://d1reana485161v.cloudfront.net/i/logo_findtutors_v3.svg"
          alt="logo"
          className="h-15 w-auto hover:cursor-pointer"
        />
        <nav className="hidden lg:flex gap-5">
          <NavItem to="/">Trang chủ</NavItem>

          <NavItem
            to="/dich-vu-gia-su"
            matchPrefix="/dich-vu-gia-su/*"
            hasDropdown
          >
            Dịch vụ gia sư
          </NavItem>

          <NavItem
            to="/hoc-phi-gia-su"
            // matchPrefix="/hoc-phi-gia-su/*"
            // hasDropdown
          >
            Học phí gia sư
          </NavItem>

          <NavItem
            to="/lop-hien-co"
            // matchPrefix="/lop-hien-co/*" hasDropdown
          >
            Lớp hiện có cần gia sư
          </NavItem>

          <NavItem to="/lien-he">Liên hệ</NavItem>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-gray-800">
                <User size={18} />
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-gray-500 capitalize">
                  ({user.role === 'phu_huynh' ? 'Phụ huynh' : user.role === 'gia_su' ? 'Gia sư' : user.role})
                </span>
              </div>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <LogIn size={18} />
              Đăng nhập
            </button>
          )}
        </div>

        <button
          className="hover:cursor-pointer lg:hidden bg-transparent"
          onClick={() => setOpenSidebar(true)}
        >
          <Menu size={26} />
        </button>
      </div>
      <Sidebar 
        open={openSidebar} 
        onClose={() => setOpenSidebar(false)}
        user={user}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
      />
    </header>
  );
};

export default Header;
