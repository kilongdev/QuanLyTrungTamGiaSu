export default function DashboardFooter({ sidebarCollapsed }) {
  return (
    <footer className={`bg-white border-t border-gray-200 py-2 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
      <div className="px-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-gray-500 text-xs">
          © 2026 Trung Tâm Gia Sư. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <a href="#" className="text-gray-500 hover:text-blue-600 text-xs transition-colors">Hỗ trợ</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 text-xs transition-colors">Chính sách</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 text-xs transition-colors">Điều khoản</a>
        </div>
      </div>
    </footer>
  )
}
