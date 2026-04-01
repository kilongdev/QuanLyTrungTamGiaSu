import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardSidebar({
  menuItems,
  activeItem,
  onMenuClick,
  userRole,
  collapsed,
  hoverExpanded,
  onHoverEnter,
  onHoverLeave,
  isMobileOpen,
  onCloseMobile,
}) {
  const roleColors = {
    admin: "from-red-700 to-red-800",
    gia_su: "from-red-700 to-red-800",
    phu_huynh: "from-red-700 to-red-800",
  };

  const isDesktop = window.innerWidth >= 768;

  const isExpanded = isDesktop ? !collapsed || hoverExpanded : true;

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-300 z-40 md:hidden",
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[80%] max-w-sm bg-white z-50",
          "transform transition-transform duration-300",

          "top-0 h-screen w-[80%] max-w-sm",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",

          "md:top-16 md:h-[calc(100vh-64px)] md:left-0 md:translate-x-0",
          isExpanded ? "md:w-64" : "md:w-20",
        )}
        onMouseEnter={() => {
          if (window.innerWidth >= 768 && collapsed) {
            onHoverEnter();
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 768) {
            onHoverLeave();
          }
        }}
      >
        {/* Close button (mobile only) */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={onCloseMobile}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onMenuClick(item.id);
                  onCloseMobile();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  activeItem === item.id
                    ? `bg-gradient-to-r ${
                        roleColors[userRole] || "from-blue-500 to-purple-600"
                      } text-white shadow-md`
                    : "text-gray-600 hover:bg-gray-100",
                  isExpanded ? "" : "justify-center",
                )}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
