import React, { useState } from "react";
import NavItem from "./NavItem";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "../Sidebar";

const Header = () => {
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

        <button
          className="hover:cursor-pointer lg:hidden bg-transparent"
          onClick={() => setOpenSidebar(true)}
        >
          <Menu size={26} />
        </button>
      </div>
      <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />
    </header>
  );
};

export default Header;
