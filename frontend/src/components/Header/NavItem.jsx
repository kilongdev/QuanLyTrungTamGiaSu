import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";

const NavItem = ({ children, hasDropdown, to, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-1 px-2 py-2 transition-colors",
          isActive ? "text-blue-400" : "text-black hover:text-blue-400",
        )
      }
    >
      <span className="relative inline-block">
        {children}
        <span
          className="
        absolute -bottom-1 left-0 h-[2px] w-full bg-blue-400
        scale-x-0 origin-center transition-transform duration-300
        group-hover:scale-x-100
        group-[&[aria-current=page]]:scale-x-100
      "
        />
      </span>

      {hasDropdown && <ChevronDown size={18} />}
    </NavLink>
  );
};

export default NavItem;
