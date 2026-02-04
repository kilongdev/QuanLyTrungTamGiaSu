import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'

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
      <Sidebar 
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
        <Navbar 
          user={user} 
          onLogout={onLogout}
          pageTitle={pageTitle}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {children}
        </main>

        {/* Footer */}
        <Footer sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  )
}
