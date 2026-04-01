import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import DashboardFooter from "./DashboardFooter";
import EditProfileModal from "../components/EditProfileModal";

export default function DashboardLayout({
  children,
  user,
  onLogout,
  showEditProfile,
  setShowEditProfile,
  menuItems,
  activeItem,
  onMenuClick,
  pageTitle,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [modalTab, setModalTab] = useState("profile");

  const handleEditProfile = () => {
    setModalTab("profile");
    setShowEditProfile(true);
  };

  const handleChangePassword = () => {
    setModalTab("password");
    setShowEditProfile(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sidebar */}
      <DashboardSidebar
        menuItems={menuItems}
        activeItem={activeItem}
        onMenuClick={onMenuClick}
        userRole={user?.role}
        collapsed={sidebarCollapsed}
        hoverExpanded={hoverExpanded}
        onHoverEnter={() => sidebarCollapsed && setHoverExpanded(true)}
        onHoverLeave={() => setHoverExpanded(false)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <DashboardNavbar
          user={user}
          onLogout={onLogout}
          onEditProfile={handleEditProfile}
          onChangePassword={handleChangePassword}
          pageTitle={pageTitle}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content */}
        <main
          className={`
            flex-1 p-4 mt-16 bg-gray-100 transition-all duration-300
            ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}
            ml-0
          `}
        >
          {children}
        </main>

        <DashboardFooter sidebarCollapsed={sidebarCollapsed} />
      </div>

      {/* Modal */}
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          initialTab={modalTab}
        />
      )}
    </div>
  );
}
