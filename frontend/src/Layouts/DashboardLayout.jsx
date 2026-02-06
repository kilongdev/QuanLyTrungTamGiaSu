import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardNavbar from './DashboardNavbar'
import DashboardFooter from './DashboardFooter'

export default function DashboardLayout({ 
  children, 
  user, 
  onLogout, 
  menuItems, 
  activeItem, 
  onMenuClick,
  pageTitle 
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [hoverExpanded, setHoverExpanded] = useState(false)

  // Sidebar hiển thị mở rộng khi không collapsed HOẶC khi hover
  const isSidebarExpanded = !sidebarCollapsed || hoverExpanded

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
          pageTitle={pageTitle}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content */}
        <main className={`flex-1 p-4 mt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} bg-gray-100 rounded-tl-3xl min-h-[calc(100vh-64px)]`}>
          {children}
        </main>

        {/* Footer */}
        <DashboardFooter sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  )
}
