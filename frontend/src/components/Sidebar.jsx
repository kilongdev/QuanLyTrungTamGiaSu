import { cn } from "@/lib/utils";
import React, { useState } from "react";
import NavItem from "./Header/NavItem";

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-300",
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
        {/* <div className="flex justify-end p-4">
          <button onClick={() => setOpenSidebar(false)}>
            <X size={24} />
          </button>
        </div> */}

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
      </aside>
    </>
  );
};

export default Sidebar;
