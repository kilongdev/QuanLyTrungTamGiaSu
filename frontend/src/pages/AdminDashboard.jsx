import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, BookOpen, GraduationCap, Briefcase, FileText } from 'lucide-react';

import DashboardLayout from '../Layouts/DashboardLayout';

// Import các component quản lý
import LopHocManagement from '../components/LopHocManagement';
import PhuHuynhManagement from '../components/PhuHuynhManagement';
import HocSinhManagement from '../components/HocSinhManagement';
import GiaSuManagement from '../components/GiaSuManagement';
import DashboardOverview from '../components/DashboardOverview';

// Giả sử đây là component trang Dashboard chính của bạn
export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard'); // <-- Đặt 'dashboard' làm trang mặc định
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'admin') {
      setUser(storedUser);
    } else {
      // Nếu không phải admin, chuyển về trang chủ hoặc trang đăng nhập
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  // Định nghĩa các mục menu cho admin
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'hocsinh', label: 'Quản lý Học sinh', icon: GraduationCap }, // <-- Thêm mục menu mới
    { id: 'phuhuynh', label: 'Quản lý Phụ huynh', icon: Users },
    { id: 'giasu', label: 'Quản lý Gia sư', icon: Briefcase },
    { id: 'lophoc', label: 'Quản lý Lớp học', icon: BookOpen },
    { id: 'baocao', label: 'Báo cáo', icon: FileText },
  ];

  // Hàm để render component tương ứng với menu được chọn
  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveItem} />;
      case 'hocsinh':
        return <HocSinhManagement />; // <-- Hiển thị component khi menu được chọn
      case 'phuhuynh':
        return <PhuHuynhManagement />;
      case 'giasu':
        return <GiaSuManagement />;
      case 'lophoc':
        return <LopHocManagement />;
      // Thêm các case khác cho các mục menu còn lại
      // default:
      //   return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      menuItems={menuItems}
      activeItem={activeItem}
      onMenuClick={(id) => setActiveItem(id)}
      pageTitle="Trang quản trị"
    >
      {renderContent()}
    </DashboardLayout>
  );
}