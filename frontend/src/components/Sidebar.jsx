import { cn } from "@/lib/utils";
import React, { useState } from "react";
import {
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  X,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ open, onClose, user, onLogin, onLogout }) => {
  const [openParent, setOpenParent] = useState(null);

  const toggleMenu = (menu) => {
    setOpenParent(openParent === menu ? null : menu);
  };

  return (
    <>
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
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-3 px-5">
          <Link to="/" onClick={onClose}>
            Trang chủ
          </Link>

          <button
            onClick={() => toggleMenu("ph")}
            className="flex justify-between items-center"
          >
            Phụ huynh <ChevronDown size={18} />
          </button>

          {openParent === "ph" && (
            <div className="flex flex-col pl-4 gap-2 text-gray-600">
              <Link to="/dich-vu-gia-su" onClick={onClose}>
                Dịch vụ gia sư
              </Link>
              <Link to="/hoc-phi-gia-su" onClick={onClose}>
                Học phí gia sư
              </Link>
            </div>
          )}
          <Link to="/hoc-phi-gia-su" onClick={onClose}>
            Học phí gia sư
          </Link>

          <Link to="/lop-hien-co" onClick={onClose}>
            Lớp học hiện có
          </Link>

          <Link to="/lien-he" onClick={onClose}>
            Liên hệ
          </Link>
        </nav>

        {/* Auth */}
        <div className="px-5 pt-4 border-t mt-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg justify-center"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <button
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-3 text-red-600 justify-center"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onLogin?.();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg justify-center"
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
