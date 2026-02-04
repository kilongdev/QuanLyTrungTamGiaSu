export default function Navbar({ user, onLogout, pageTitle, sidebarCollapsed }) {
  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left - Page Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
        </div>

        {/* Right - User info & actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent outline-none text-sm w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'phu_huynh' ? 'Phụ huynh' : user?.role === 'gia_su' ? 'Gia sư' : user?.role === 'admin' ? 'Quản trị viên' : user?.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Đăng xuất"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
