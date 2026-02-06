import { useState, useEffect } from 'react'
import DashboardLayout from '../Layouts/DashboardLayout'
import { LayoutDashboard, Users, GraduationCap, Search, Calendar, CreditCard, UserCircle } from 'lucide-react'

export default function PhuHuynhDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  useEffect(() => {
    // Log token để kiểm tra
    const token = localStorage.getItem('token')
    console.log('=== PHỤ HUYNH DASHBOARD ===')
    console.log('User:', user)
    console.log('Token:', token)
  }, [user])

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'children', label: 'Con của tôi', icon: Users },
    { id: 'tutors', label: 'Gia sư của con', icon: GraduationCap },
    { id: 'find-tutor', label: 'Tìm gia sư', icon: Search },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    { id: 'payments', label: 'Thanh toán', icon: CreditCard },
    { id: 'profile', label: 'Hồ sơ', icon: UserCircle },
  ]

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeMenu)
    return item ? item.label : 'Tổng quan'
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />
      case 'children':
        return <ChildrenContent />
      case 'tutors':
        return <TutorsContent />
      case 'find-tutor':
        return <FindTutorContent />
      case 'schedule':
        return <PlaceholderContent title="Lịch học" description="Xem lịch học của con" />
      case 'payments':
        return <PlaceholderContent title="Thanh toán" description="Quản lý thanh toán học phí" />
      case 'profile':
        return <PlaceholderContent title="Hồ sơ" description="Cập nhật thông tin cá nhân" />
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
      {/* Children Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChildCard 
          name="Nguyễn Văn An"
          grade="Lớp 9"
          age="14 tuổi"
          subjects={2}
          avgScore="8.5"
          sessions={12}
          initial="A"
          gradient="from-pink-400 to-purple-400"
        />
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-dashed border-gray-200 flex items-center justify-center min-h-[200px]">
          <button className="text-center text-gray-400 hover:text-blue-500 transition-colors">
            <span className="text-4xl block mb-2">➕</span>
            <span className="font-medium">Thêm con</span>
          </button>
        </div>
      </div>

      {/* Current Tutors */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">👨‍🏫 Gia sư hiện tại</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Xem tất cả</button>
        </div>
        <div className="space-y-3">
          <TutorItem 
            name="Trần Minh Tuấn"
            subject="Toán"
            rating="4.9"
            experience="5 năm"
            initial="T"
            gradient="from-blue-500 to-purple-500"
          />
          <TutorItem 
            name="Lê Thị Hương"
            subject="Tiếng Anh"
            rating="4.8"
            experience="3 năm"
            initial="H"
            gradient="from-green-500 to-teal-500"
          />
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Lịch học sắp tới</h3>
        <div className="space-y-3">
          <UpcomingClass 
            subject="Toán"
            tutor="Trần Minh Tuấn"
            time="Thứ 2, 08:00 - 09:30"
            child="An"
          />
          <UpcomingClass 
            subject="Tiếng Anh"
            tutor="Lê Thị Hương"
            time="Thứ 3, 15:00 - 16:30"
            child="An"
          />
        </div>
      </div>
    </div>
  )
}

// Children Content
function ChildrenContent() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">
          ➕ Thêm con
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChildCard 
          name="Nguyễn Văn An"
          grade="Lớp 9"
          age="14 tuổi"
          subjects={2}
          avgScore="8.5"
          sessions={12}
          initial="A"
          gradient="from-pink-400 to-purple-400"
          showDetails={true}
        />
      </div>
    </div>
  )
}

// Tutors Content
function TutorsContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Danh sách gia sư</h3>
        <div className="space-y-4">
          <TutorDetailCard 
            name="Trần Minh Tuấn"
            subject="Toán"
            rating="4.9"
            experience="5 năm"
            child="An"
            schedule="Thứ 2, 4, 6 - 08:00"
            fee="300.000đ/buổi"
            initial="T"
            gradient="from-blue-500 to-purple-500"
          />
          <TutorDetailCard 
            name="Lê Thị Hương"
            subject="Tiếng Anh"
            rating="4.8"
            experience="3 năm"
            child="An"
            schedule="Thứ 3, 5 - 15:00"
            fee="250.000đ/buổi"
            initial="H"
            gradient="from-green-500 to-teal-500"
          />
        </div>
      </div>
    </div>
  )
}

// Find Tutor Content
function FindTutorContent() {
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">🔍 Tìm gia sư phù hợp</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Chọn môn học</option>
              <option>Toán</option>
              <option>Lý</option>
              <option>Hóa</option>
              <option>Tiếng Anh</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Chọn lớp</option>
              <option>Lớp 6</option>
              <option>Lớp 7</option>
              <option>Lớp 8</option>
              <option>Lớp 9</option>
              <option>Lớp 10</option>
              <option>Lớp 11</option>
              <option>Lớp 12</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Chọn khu vực</option>
              <option>Quận 1</option>
              <option>Quận 3</option>
              <option>Quận 7</option>
              <option>Bình Thạnh</option>
            </select>
          </div>
        </div>
        <button className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium">
          Tìm kiếm
        </button>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Gia sư phù hợp</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TutorSearchCard 
            name="Nguyễn Văn Đức"
            subjects={['Toán', 'Lý']}
            rating="4.9"
            experience="6 năm"
            fee="350.000đ/buổi"
            location="Quận 1, 3, 7"
          />
          <TutorSearchCard 
            name="Phạm Thị Mai"
            subjects={['Toán']}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
        </div>
      </div>
    </div>
  )
}

// Child Card Component
function ChildCard({ name, grade, age, subjects, avgScore, sessions, initial, gradient, showDetails = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
          {initial}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg">{name}</p>
          <p className="text-gray-500">{grade} • {age}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xl font-bold text-blue-600">{subjects}</p>
          <p className="text-xs text-gray-500">Môn học</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xl font-bold text-green-600">{avgScore}</p>
          <p className="text-xs text-gray-500">Điểm TB</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3">
          <p className="text-xl font-bold text-purple-600">{sessions}</p>
          <p className="text-xs text-gray-500">Buổi học</p>
        </div>
      </div>
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
            Xem chi tiết
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
            Chỉnh sửa
          </button>
        </div>
      )}
    </div>
  )
}

// Tutor Item Component
function TutorItem({ name, subject, rating, experience, initial, gradient }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white font-bold`}>
        {initial}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-gray-500 text-sm">{subject} • ⭐ {rating} • {experience} kinh nghiệm</p>
      </div>
      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium">
        Nhắn tin
      </button>
    </div>
  )
}

// Tutor Detail Card Component
function TutorDetailCard({ name, subject, rating, experience, child, schedule, fee, initial, gradient }) {
  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
          {initial}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{name}</p>
          <p className="text-gray-500 text-sm">{subject} • ⭐ {rating} • {experience} kinh nghiệm</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Đang dạy</span>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-sm">
        <p className="text-gray-600"><strong>Dạy cho:</strong> {child}</p>
        <p className="text-gray-600"><strong>Lịch:</strong> {schedule}</p>
        <p className="text-gray-600"><strong>Học phí:</strong> {fee}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
          Nhắn tin
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
          Đánh giá
        </button>
      </div>
    </div>
  )
}

// Tutor Search Card Component
function TutorSearchCard({ name, subjects, rating, experience, fee, location }) {
  return (
    <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{name}</p>
          <div className="flex gap-1">
            {subjects.map((sub, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{sub}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p>⭐ {rating} • {experience} kinh nghiệm</p>
        <p>📍 {location}</p>
        <p className="text-green-600 font-medium">{fee}</p>
      </div>
      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
        Liên hệ ngay
      </button>
    </div>
  )
}

// Upcoming Class Component
function UpcomingClass({ subject, tutor, time, child }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
        <span className="text-2xl">📚</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{subject} - {child}</p>
        <p className="text-gray-500 text-sm">👨‍🏫 {tutor} • {time}</p>
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
