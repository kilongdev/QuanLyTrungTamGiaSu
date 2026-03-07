import { useState, useEffect } from 'react'
import DashboardLayout from '../Layouts/DashboardLayout'
import { LayoutDashboard, GraduationCap, Users, UserRound, BookOpen, BookText, CreditCard, BarChart3 } from 'lucide-react'
import LopHocManagement from '../components/LopHocManagement'

export default function AdminDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  useEffect(() => {
    // Log token để kiểm tra
    const token = localStorage.getItem('token')
    console.log('=== ADMIN DASHBOARD ===')
    console.log('User:', user)
    console.log('Token:', token)
  }, [user])

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'tutors', label: 'Gia sư', icon: GraduationCap },
    { id: 'parents', label: 'Phụ huynh', icon: Users },
    { id: 'students', label: 'Học sinh', icon: UserRound },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'subjects', label: 'Môn học', icon: BookText },
    { id: 'payments', label: 'Thanh toán', icon: CreditCard },
    { id: 'reports', label: 'Báo cáo thống kê', icon: BarChart3 },
  ]

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeMenu)
    return item ? item.label : 'Tổng quan'
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />
      case 'tutors':
        return <PlaceholderContent title="Gia sư" description="Quản lý và theo dõi gia sư trong hệ thống" />
      case 'parents':
        return <PlaceholderContent title="Phụ huynh" description="Quản lý thông tin phụ huynh" />
      case 'students':
        return <PlaceholderContent title="Học sinh" description="Quản lý thông tin học sinh" />
      case 'classes':
        return <LopHocManagement />
      case 'subjects':
        return <PlaceholderContent title="Môn học" description="Quản lý danh sách môn học" />
      case 'payments':
        return <PlaceholderContent title="Thanh toán" description="Quản lý thanh toán và hoa hồng" />
      case 'reports':
        return <PlaceholderContent title="Báo cáo thống kê" description="Xem báo cáo và thống kê" />
      default:
        return <DashboardContent />
    }
  }

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      menuItems={menuItems}
      activeItem={activeMenu}
      onMenuClick={setActiveMenu}
      pageTitle={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  )
}

// Dashboard Overview Content
function DashboardContent() {
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon="📊" 
          iconBg="bg-blue-100" 
          value="150" 
          label="Gia sư" 
          trend="+12%" 
          trendUp={true} 
        />
        <StatCard 
          icon="👨‍👩‍👧" 
          iconBg="bg-green-100" 
          value="320" 
          label="Phụ huynh" 
          trend="+8%" 
          trendUp={true} 
        />
        <StatCard 
          icon="📚" 
          iconBg="bg-purple-100" 
          value="85" 
          label="Lớp học" 
          trend="+5%" 
          trendUp={true} 
        />
        <StatCard 
          icon="💰" 
          iconBg="bg-yellow-100" 
          value="25M" 
          label="Doanh thu tháng" 
          trend="+15%" 
          trendUp={true} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">📈 Thống kê đăng ký</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Biểu đồ thống kê</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">📊 Doanh thu theo tháng</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Biểu đồ doanh thu</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-3">🕒 Hoạt động gần đây</h3>
        <div className="space-y-2">
          <ActivityItem 
            avatar="T"
            title="Nguyễn Văn Tuấn đã đăng ký làm gia sư"
            time="5 phút trước"
            type="new"
          />
          <ActivityItem 
            avatar="H"
            title="Lớp Toán 9 đã được ghép cặp thành công"
            time="1 giờ trước"
            type="success"
          />
          <ActivityItem 
            avatar="L"
            title="Phụ huynh Lê Thị Mai yêu cầu tìm gia sư"
            time="2 giờ trước"
            type="request"
          />
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon, iconBg, value, label, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center text-lg`}>
          {icon}
        </div>
        <span className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
      <p className="text-xl font-bold text-gray-800 mt-3">{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  )
}

// Activity Item Component
function ActivityItem({ avatar, title, time, type }) {
  const bgColors = {
    new: 'bg-blue-500',
    success: 'bg-green-500',
    request: 'bg-purple-500'
  }

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-8 h-8 ${bgColors[type] || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
        {avatar}
      </div>
      <div className="flex-1">
        <p className="text-gray-800 text-sm">{title}</p>
        <p className="text-gray-400 text-xs">{time}</p>
      </div>
    </div>
  )
}

// Placeholder Content Component
function PlaceholderContent({ title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      <p className="text-gray-400 text-xs">Tính năng đang được phát triển...</p>
    </div>
  )
}
