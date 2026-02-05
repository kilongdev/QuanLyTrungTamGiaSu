export default function DashboardSidebar({ menuItems, activeItem, onMenuClick, userRole, collapsed, onToggle }) {
  const roleColors = {
    admin: 'from-red-600 to-red-700',
    gia_su: 'from-blue-600 to-purple-600',
    phu_huynh: 'from-green-600 to-teal-600'
  }

  const roleNames = {
    admin: 'Admin',
    gia_su: 'Gia Sư',
    phu_huynh: 'Phụ Huynh'
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 fixed left-0 top-0 h-full z-50`}>
      {/* Logo */}
      <div className={`p-3 border-b border-gray-100 flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
        <div className={`w-8 h-8 bg-gradient-to-r ${roleColors[userRole] || 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Gia Sư</h1>
            <p className="text-xs text-gray-500">{roleNames[userRole] || 'Dashboard'}</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-2.5 top-16 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
      >
        <svg className={`w-3 h-3 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-sm ${
              activeItem === item.id 
                ? `bg-gradient-to-r ${roleColors[userRole] || 'from-blue-500 to-purple-600'} text-white shadow-md` 
                : 'text-gray-600 hover:bg-gray-100'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="text-base">{item.icon}</span>
            {!collapsed && <span className="font-medium text-xs">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-100">
        <button 
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Cài đặt' : ''}
        >
          <span className="text-base">⚙️</span>
          {!collapsed && <span className="font-medium text-xs">Cài đặt</span>}
        </button>
      </div>
    </aside>
  )
}
