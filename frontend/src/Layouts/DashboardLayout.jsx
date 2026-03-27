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
  const [modalTab, setModalTab] = useState("profile");

  // Sidebar hiển thị mở rộng khi không collapsed HOẶC khi hover
  const isSidebarExpanded = !sidebarCollapsed || hoverExpanded;

  const handleEditProfile = () => {
    setModalTab("profile");
    setShowEditProfile(true);
  };

  const handleChangePassword = () => {
    setModalTab("password");
    setShowEditProfile(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      />

      {/* Main Content Area */}
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
        />

        {/* Content */}
        <main
          className={`flex-1 p-4 mt-16 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"} bg-gray-100 rounded-tl-3xl min-h-[calc(100vh-64px)]`}
        >
          {children}
        </main>

        {/* Footer */}
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
