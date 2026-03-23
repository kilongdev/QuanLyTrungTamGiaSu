import { Menu, Bell, LogOut } from 'lucide-react'

export default function DashboardNavbar({ user, onLogout, pageTitle, sidebarCollapsed, onToggleSidebar }) {
  return (
    <header className="bg-gray-50 fixed top-0 left-0 right-0 z-50">
      <div className="h-16 flex items-center justify-between">
        {/* Left - Toggle Button & Logo */}
        <div className="flex items-center h-full">
          {/* Toggle button container - căn với sidebar */}
          <div className="w-20 flex justify-center flex-shrink-0">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          {/* Logo - luôn hiển thị */}
          <div className="pl-2">
            <img 
              src="https://d1reana485161v.cloudfront.net/i/logo_findtutors_v3.svg" 
              alt="FindTutors" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Right - User info & actions */}
        <div className="flex items-center gap-4 pr-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
            <div className="text-right">
              <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'phu_huynh' ? 'Phụ huynh' : user?.role === 'gia_su' ? 'Gia sư' : user?.role === 'admin' ? 'Quản trị viên' : user?.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
