import { useState, useEffect } from 'react'
import DashboardLayout from '../Layouts/DashboardLayout'

export default function GiaSuDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  useEffect(() => {
    // Log token để kiểm tra
    const token = localStorage.getItem('token')
    console.log('=== GIA SƯ DASHBOARD ===')
    console.log('User:', user)
    console.log('Token:', token)
  }, [user])

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'schedule', label: 'Lịch dạy', icon: '📅' },
    { id: 'classes', label: 'Lớp đang dạy', icon: '📚' },
    { id: 'students', label: 'Học sinh', icon: '👨‍🎓' },
    { id: 'requests', label: 'Yêu cầu mới', icon: '📩' },
    { id: 'income', label: 'Thu nhập', icon: '💰' },
    { id: 'profile', label: 'Hồ sơ', icon: '👤' },
  ]

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeMenu)
    return item ? item.label : 'Tổng quan'
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />
      case 'schedule':
        return <ScheduleContent />
      case 'classes':
        return <PlaceholderContent title="Lớp đang dạy" description="Xem và quản lý các lớp bạn đang dạy" />
      case 'students':
        return <PlaceholderContent title="Học sinh" description="Thông tin học sinh của bạn" />
      case 'requests':
        return <PlaceholderContent title="Yêu cầu mới" description="Các yêu cầu dạy mới từ phụ huynh" />
      case 'income':
        return <PlaceholderContent title="Thu nhập" description="Theo dõi thu nhập và thanh toán" />
      case 'profile':
        return <PlaceholderContent title="Hồ sơ" description="Cập nhật thông tin cá nhân và kinh nghiệm" />
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon="📚" 
          iconBg="bg-blue-100" 
          value="5" 
          label="Lớp đang dạy" 
        />
        <StatCard 
          icon="👨‍🎓" 
          iconBg="bg-green-100" 
          value="12" 
          label="Học sinh" 
        />
        <StatCard 
          icon="⭐" 
          iconBg="bg-yellow-100" 
          value="4.8" 
          label="Đánh giá TB" 
        />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Lịch dạy hôm nay</h3>
        <div className="space-y-3">
          <ScheduleItem 
            time="08:00 - 09:30"
            subject="Toán lớp 9"
            student="Nguyễn Văn An"
            location="123 Nguyễn Huệ, Q.1"
            status="confirmed"
          />
          <ScheduleItem 
            time="14:00 - 15:30"
            subject="Lý lớp 10"
            student="Trần Thị Bình"
            location="456 Lê Lợi, Q.3"
            status="pending"
          />
          <ScheduleItem 
            time="19:00 - 20:30"
            subject="Hóa lớp 11"
            student="Lê Minh Châu"
            location="Online - Zoom"
            status="confirmed"
          />
        </div>
      </div>

      {/* New Requests */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">📩 Yêu cầu mới</h3>
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">3 mới</span>
        </div>
        <div className="space-y-3">
          <RequestItem 
            subject="Toán lớp 12"
            location="Quận 7"
            fee="300.000đ/buổi"
            time="2 buổi/tuần"
          />
          <RequestItem 
            subject="Tiếng Anh lớp 8"
            location="Quận Bình Thạnh"
            fee="250.000đ/buổi"
            time="3 buổi/tuần"
          />
        </div>
      </div>
    </div>
  )
}

// Schedule Content
function ScheduleContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800">Lịch dạy tuần này</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              ← Tuần trước
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Tuần sau →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
            <div key={day} className="text-center">
              <p className="font-medium text-gray-500 mb-2">{day}</p>
              <div className={`h-24 rounded-xl border-2 border-dashed ${idx === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} flex items-center justify-center`}>
                {idx === 0 && <span className="text-sm text-blue-600">2 buổi</span>}
                {idx === 2 && <span className="text-sm text-gray-400">1 buổi</span>}
                {idx === 4 && <span className="text-sm text-gray-400">3 buổi</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon, iconBg, value, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )
}

// Schedule Item Component
function ScheduleItem({ time, subject, student, location, status }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${status === 'confirmed' ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <div className="text-center min-w-[80px]">
        <p className={`font-bold ${status === 'confirmed' ? 'text-blue-600' : 'text-gray-600'}`}>
          {time.split(' - ')[0]}
        </p>
        <p className={`text-xs ${status === 'confirmed' ? 'text-blue-400' : 'text-gray-400'}`}>
          {time.split(' - ')[1]}
        </p>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{subject} - {student}</p>
        <p className="text-gray-500 text-sm">📍 {location}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        status === 'confirmed' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
      </span>
    </div>
  )
}

// Request Item Component
function RequestItem({ subject, location, fee, time }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{subject}</p>
        <p className="text-gray-500 text-sm">📍 {location} • {time}</p>
        <p className="text-green-600 font-medium text-sm">{fee}</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
          Nhận lớp
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium">
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}

// Placeholder Content Component
function PlaceholderContent({ title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{description}</p>
      <p className="text-gray-400 text-sm">Tính năng đang được phát triển...</p>
    </div>
  )
}
