import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Briefcase, FileText, Calendar, ClipboardList, BookCheck } from 'lucide-react';

import DashboardLayout from '../Layouts/DashboardLayout';
import DashboardOverview from '../components/DashboardOverview';
import LopHocManagement from '../components/LopHocManagement';
import PhuHuynhManagement from '../components/PhuHuynhManagement';
import HocSinhManagement from '../components/HocSinhManagement';
import GiaSuManagement from '../components/GiaSuManagement';
import LichHocManagement from '../components/LichHocManagement';
import YeuCauManagement from '../components/YeuCauManagement';
import DangKyLopManagement from '../components/DangKyLopManagement'; // Module đăng ký lớp tụi mình vừa làm

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (storedUser && storedUser.role === 'admin' && token) {
      setUser(storedUser);
    } else {
      // Nếu không phải admin hoặc mất token, đá văng ra ngoài
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'dang_ky_lop', label: 'Duyệt Đơn Đăng Ký', icon: BookCheck }, // Gắn thêm ở đây
    { id: 'schedule', label: 'Quản lý Lịch học', icon: Calendar },
    { id: 'requests', label: 'Yêu cầu hỗ trợ', icon: ClipboardList },
    { id: 'lophoc', label: 'Quản lý Lớp học', icon: BookOpen },
    { id: 'hocsinh', label: 'Quản lý Học sinh', icon: GraduationCap },
    { id: 'phuhuynh', label: 'Quản lý Phụ huynh', icon: Users },
    { id: 'giasu', label: 'Quản lý Gia sư', icon: Briefcase },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeItem);
    return item ? item.label : 'Trang quản trị';
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveItem} />;
      case 'dang_ky_lop':
        return <DangKyLopManagement user={user} />;
      case 'schedule':
        return <LichHocManagement user={user} />;
      case 'requests':
        return <YeuCauManagement user={user} />;
      case 'lophoc':
        return <LopHocManagement />;
      case 'hocsinh':
        return <HocSinhManagement />;
      case 'phuhuynh':
        return <PhuHuynhManagement />;
      case 'giasu':
        return <GiaSuManagement />;
      default:
        return <DashboardOverview onNavigate={setActiveItem} />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      menuItems={menuItems}
      activeItem={activeItem}
      onMenuClick={setActiveItem}
      pageTitle={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  );
}