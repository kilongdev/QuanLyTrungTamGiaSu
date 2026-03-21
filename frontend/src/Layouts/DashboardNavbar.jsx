import { useState } from 'react'
import { Menu, Bell, LogOut, User, Lock, ChevronDown } from 'lucide-react'

export default function DashboardNavbar({ user, onLogout, pageTitle, sidebarCollapsed, onToggleSidebar, onEditProfile, onChangePassword }) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleEditProfile = () => {
    setShowUserMenu(false)
    if (onEditProfile) onEditProfile()
  }

  const handleChangePassword = () => {
    setShowUserMenu(false)
    if (onChangePassword) onChangePassword()
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    onLogout()
  }

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

          {/* User Info & Dropdown Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-300 relative">
            <div className="text-right">
              <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'phu_huynh' ? 'Phụ huynh' : user?.role === 'gia_su' ? 'Gia sư' : user?.role === 'admin' ? 'Quản trị viên' : user?.role}
              </p>
            </div>
            
            {/* User Menu Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  Sửa thông tin cá nhân
                </button>
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  Thay đổi mật khẩu
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  )
}
