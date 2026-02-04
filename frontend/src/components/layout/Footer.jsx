export default function Footer({ sidebarCollapsed }) {
  return (
    <footer className={`bg-white border-t border-gray-200 py-4 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-gray-500 text-sm">
          © 2026 Trung Tâm Gia Sư. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Hỗ trợ</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Chính sách</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Điều khoản</a>
        </div>
      </div>
    </footer>
  )
}
