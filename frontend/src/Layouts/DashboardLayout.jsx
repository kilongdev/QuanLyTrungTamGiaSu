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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sidebar */}
      <DashboardSidebar 
        menuItems={menuItems}
        activeItem={activeItem}
        onMenuClick={onMenuClick}
        userRole={user?.role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <DashboardNavbar 
          user={user} 
          onLogout={onLogout}
          pageTitle={pageTitle}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Content */}
        <main className={`flex-1 p-4 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
          {children}
        </main>

        {/* Footer */}
        <DashboardFooter sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  )
}
