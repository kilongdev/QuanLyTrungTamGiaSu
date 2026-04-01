import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

const NavItem = ({ children, hasDropdown, to, dropdownItems }) => {
  return (
    <div className="relative group">
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-1 px-2 py-2 transition-colors",
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
          "
          />
        </span>

        {hasDropdown && (
          <ChevronDown
            size={18}
            className="transition-transform duration-300 group-hover:rotate-180"
          />
        )}
      </NavLink>

      {hasDropdown && dropdownItems && (
        <div className="absolute left-0 top-full hidden min-w-[180px] flex-col rounded-lg bg-white py-2 shadow-lg group-hover:flex">
          {dropdownItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 hover:bg-blue-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavItem;
