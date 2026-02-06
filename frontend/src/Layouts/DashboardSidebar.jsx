import { Settings } from 'lucide-react'

export default function DashboardSidebar({ menuItems, activeItem, onMenuClick, userRole, collapsed, hoverExpanded, onHoverEnter, onHoverLeave }) {
  const roleColors = {
    admin: 'from-red-700 to-red-800',
    gia_su: 'from-red-700 to-red-800',
    phu_huynh: 'from-red-700 to-red-800'
  }

  const roleNames = {
    admin: 'Admin',
    gia_su: 'Gia Sư',
    phu_huynh: 'Phụ Huynh'
  }

  // Hiển thị mở rộng khi không collapsed HOẶC khi hover
  const isExpanded = !collapsed || hoverExpanded

  return (
    <aside 
      className={`${isExpanded ? 'w-64' : 'w-20'} bg-gray-50 flex flex-col transition-all duration-300 fixed left-0 top-16 h-[calc(100vh-64px)] z-40 overflow-hidden`}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeItem === item.id 
                  ? `bg-gradient-to-r ${roleColors[userRole] || 'from-blue-500 to-purple-600'} text-white shadow-md` 
                  : 'text-gray-600 hover:bg-gray-100'
              } ${isExpanded ? '' : 'justify-center'}`}
              title={!isExpanded ? item.label : ''}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200">
        <button 
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-all ${isExpanded ? '' : 'justify-center'}`}
          title={!isExpanded ? 'Cài đặt' : ''}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium text-sm whitespace-nowrap">Cài đặt</span>}
        </button>
      </div>
    </aside>
  )
}
