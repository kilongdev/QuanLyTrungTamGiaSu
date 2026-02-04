import { useState, useEffect } from 'react'
import AuthModal from './components/AuthModal'
import AdminDashboard from './pages/AdminDashboard'
import GiaSuDashboard from './pages/GiaSuDashboard'
import PhuHuynhDashboard from './pages/PhuHuynhDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState('login') // 'login' hoặc 'register'

  // Kiểm tra token đã lưu
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      // Log để kiểm tra khi load trang
      console.log('=== APP LOADED ===')
      console.log('Saved User:', JSON.parse(savedUser))
      console.log('Token:', token)
    }
  }, [])

  const handleAuthSuccess = (data) => {
    // Log token khi đăng nhập thành công
    console.log('=== LOGIN SUCCESS ===')
    console.log('Response data:', data)
    console.log('User:', data.user)
    console.log('Token:', data.token)
    
    setUser(data.user)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    console.log('=== LOGOUT ===')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const openLogin = () => {
    setAuthTab('login')
    setShowAuthModal(true)
  }

  const openRegister = () => {
    setAuthTab('register')
    setShowAuthModal(true)
  }

  // Hiển thị dashboard theo role của user
  if (user) {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />
      case 'gia_su':
        return <GiaSuDashboard user={user} onLogout={handleLogout} />
      case 'phu_huynh':
        return <PhuHuynhDashboard user={user} onLogout={handleLogout} />
      default:
        // Nếu role không xác định, log ra và hiển thị trang chủ
        console.log('Unknown role:', user.role)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trung Tâm Gia Sư
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Trang chủ</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Gia sư</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Lớp học</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Liên hệ</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role === 'phu_huynh' ? 'Phụ huynh' : user.role === 'gia_su' ? 'Gia sư' : user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={openLogin}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all text-sm"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
              Tìm gia sư 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> phù hợp </span>
              cho con bạn
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Kết nối phụ huynh với đội ngũ gia sư chất lượng cao. 
              Đảm bảo kết quả học tập tốt nhất cho con em bạn.
            </p>
            <div className="flex gap-4">
              <button
                onClick={openRegister}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all"
              >
                Bắt đầu ngay
              </button>
              <button className="px-8 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800">500+</h3>
                  <p className="text-gray-500 text-sm">Gia sư chất lượng</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800">1000+</h3>
                  <p className="text-gray-500 text-sm">Học sinh</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800">50+</h3>
                  <p className="text-gray-500 text-sm">Môn học</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800">4.9</h3>
                  <p className="text-gray-500 text-sm">Đánh giá</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Tại sao chọn chúng tôi?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Gia sư được xác thực</h4>
            <p className="text-gray-600">Tất cả gia sư đều được kiểm tra kỹ lưỡng về trình độ và kinh nghiệm.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Linh hoạt thời gian</h4>
            <p className="text-gray-600">Tự do sắp xếp lịch học phù hợp với thời gian của gia đình bạn.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Học phí hợp lý</h4>
            <p className="text-gray-600">Chi phí minh bạch, phù hợp với mọi gia đình.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Trung Tâm Gia Sư</h2>
          </div>
          <p className="text-gray-400">© 2026 Trung Tâm Gia Sư. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authTab}
      />
    </div>
  )
}

export default App
