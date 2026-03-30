import { useState, useEffect } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Briefcase, FileText, ClipboardList, BookCheck, DollarSign } from 'lucide-react';

import DashboardLayout from '../Layouts/DashboardLayout';
import DashboardOverview from '../components/DashboardOverview';
import LopHocManagement from '../components/LopHocManagement';
import PhuHuynhManagement from '../components/PhuHuynhManagement';
import HocSinhManagement from '../components/HocSinhManagement';
import GiaSuManagement from '../components/GiaSuManagement';
import YeuCauManagement from '../components/YeuCauManagement';
import DangKyLopManagement from '../components/DangKyLopManagement'; // Module đăng ký lớp tụi mình vừa làm
import LuongGiaSuManagement from '../components/LuongGiaSuManagement';
import HocPhiManagement from '../components/HocPhiManagement';
import LopHocEditPage from './LopHocEditPage';
import LopHocAttendancePage from './LopHocAttendancePage';

export default function AdminDashboard({ user, onLogout }) {
  const [activeItem, setActiveItem] = useState(() => localStorage.getItem('admin_active_item') || 'dashboard');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const classEditMatch = useMatch('/dashboard/lophoc/:id/edit');
  const classAttendanceMatch = useMatch('/dashboard/lophoc/:id/attendance');
  const classEditId = classEditMatch?.params?.id || null;
  const classAttendanceId = classAttendanceMatch?.params?.id || null;

  const updateActiveItem = (nextItem) => {
    setActiveItem(nextItem);
    localStorage.setItem('admin_active_item', nextItem);
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/lophoc')) {
      updateActiveItem('lophoc');
    }
  }, [location.pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'dang_ky_lop', label: 'Duyệt Đơn Đăng Ký', icon: BookCheck }, // Gắn thêm ở đây
    { id: 'requests', label: 'Yêu cầu hỗ trợ', icon: ClipboardList },
    { id: 'lophoc', label: 'Quản lý Lớp học', icon: BookOpen },
    { id: 'hocsinh', label: 'Quản lý Học sinh', icon: GraduationCap },
    { id: 'phuhuynh', label: 'Quản lý Phụ huynh', icon: Users },
    { id: 'giasu', label: 'Quản lý Gia sư', icon: Briefcase },
    { id: 'luonggiasu', label: 'Lương gia sư', icon: DollarSign },
    { id: 'hocphi', label: 'Học phí', icon: DollarSign },
  ];

  const getPageTitle = () => {
    if (classEditMatch) return 'Chỉnh sửa lớp học';
    if (classAttendanceMatch) return 'Điểm danh theo buổi';

    const item = menuItems.find(m => m.id === activeItem);
    return item ? item.label : 'Trang quản trị';
  };

  const renderContent = () => {
    if (classEditMatch) {
      return <LopHocEditPage classId={classEditId} />;
    }

    if (classAttendanceMatch) {
      return <LopHocAttendancePage classId={classAttendanceId} />;
    }

    switch (activeItem) {
      case 'dashboard':
        return <DashboardOverview onNavigate={updateActiveItem} />;
      case 'dang_ky_lop':
        return <DangKyLopManagement user={user} />;
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
      case 'luonggiasu':
        return <LuongGiaSuManagement user={user} />;
      case 'hocphi':
        return <HocPhiManagement user={user} />;
      default:
        return <DashboardOverview onNavigate={updateActiveItem} />;
    }
  };

  const handleMenuClick = (menuId) => {
    updateActiveItem(menuId);

    // Chỉ điều hướng về màn dashboard gốc khi đang đứng ở trang con của lớp học.
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      showEditProfile={showEditProfile}
      setShowEditProfile={setShowEditProfile}
      menuItems={menuItems}
      activeItem={activeItem}
      onMenuClick={handleMenuClick}
      pageTitle={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  );
}