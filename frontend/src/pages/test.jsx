const tutors = [
  { name: 'Nguyễn Văn A', subject: 'Toán học', rating: 4.9, price: '200,000', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Trần Thị B', subject: 'Tiếng Anh', rating: 4.8, price: '250,000', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Lê Văn C', subject: 'Vật lý', rating: 4.7, price: '180,000', avatar: 'https://i.pravatar.cc/150?img=3' }
];

const subjects = [
  { name: 'Toán', color: 'bg-red-100 text-red-600' },
  { name: 'Lý', color: 'bg-blue-100 text-blue-600' },
  { name: 'Hóa', color: 'bg-green-100 text-green-600' },
  { name: 'Sinh', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Văn', color: 'bg-purple-100 text-purple-600' },
  { name: 'Anh', color: 'bg-pink-100 text-pink-600' },
  { name: 'Sử', color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Địa', color: 'bg-teal-100 text-teal-600' },
  { name: 'Tin học', color: 'bg-orange-100 text-orange-600' },
  { name: 'IELTS', color: 'bg-cyan-100 text-cyan-600' },
  { name: 'TOEIC', color: 'bg-lime-100 text-lime-600' },
  { name: 'Piano', color: 'bg-rose-100 text-rose-600' }
];

function Test() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header / Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/>
              </svg>
              <span className="text-2xl font-bold text-gray-800">Gia Sư Pro</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-500 transition">Trang chủ</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition">Tìm gia sư</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition">Lớp học</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition">Liên hệ</a>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition">
                Đăng nhập
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tìm Gia Sư Phù Hợp Cho Bạn
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Kết nối với hàng ngàn gia sư chất lượng trên khắp cả nước
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <input type="text" placeholder="Nhập môn học bạn cần..." 
              className="flex-1 px-6 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"/>
            <button className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-500">5000+</div>
              <div className="text-gray-600 mt-2">Gia sư</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500">10000+</div>
              <div className="text-gray-600 mt-2">Học viên</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500">50+</div>
              <div className="text-gray-600 mt-2">Môn học</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500">98%</div>
              <div className="text-gray-600 mt-2">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Gia Sư Nổi Bật</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tutors.map((tutor, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"/>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{tutor.name}</h3>
                      <p className="text-blue-500">{tutor.subject}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-yellow-500">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      <span className="ml-1 text-gray-700">{tutor.rating}</span>
                    </div>
                    <span className="text-green-500 font-semibold">{tutor.price}đ/giờ</span>
                  </div>
                  <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Môn Học Phổ Biến</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subjects.map((subject, index) => (
              <div key={index} className={`${subject.color} p-4 rounded-xl text-center cursor-pointer hover:shadow-md transition`}>
                <span className="font-semibold">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bạn là gia sư?</h2>
          <p className="text-lg mb-8 opacity-90">
            Đăng ký ngay để tiếp cận hàng ngàn học viên đang tìm kiếm gia sư như bạn
          </p>
          <button className="px-8 py-3 bg-white text-green-500 rounded-lg hover:bg-gray-100 transition font-semibold">
            Đăng ký làm gia sư
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Gia Sư Pro</h3>
              <p className="text-gray-400">Nền tảng kết nối gia sư và học viên hàng đầu Việt Nam</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition">Điều khoản</a></li>
                <li><a href="#" className="hover:text-white transition">Chính sách</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition">Hướng dẫn</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 123 Đường ABC, TP.HCM</li>
                <li>📞 0123 456 789</li>
                <li>✉️ info@giasupro.vn</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Gia Sư Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Test;