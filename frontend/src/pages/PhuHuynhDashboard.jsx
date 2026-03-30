import { useState, useEffect } from "react";
import DashboardLayout from "../Layouts/DashboardLayout";
import { phuHuynhAPI } from "../api/phuHuynhApi";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Search,
  Calendar,
  CreditCard,
  UserCircle,
  ClipboardList,
  BookOpen,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  BookCheck,
  GraduationCap as GradeIcon,
  History,
  Loader2,
} from "lucide-react"; // Đã thêm BookOpen
import YeuCauManagement from "../components/YeuCauManagement";
import LichHocManagement from "../components/LichHocManagement";
import DangKyLopManagement from "../components/DangKyLopManagement";

export default function PhuHuynhDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [parentData, setParentData] = useState(null);
  const [dashboardData, setDashboardData] = useState({ tutors: [], upcoming_classes: [] });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Hàm tính tuổi đơn giản dựa trên năm sinh
  const calculateAge = (birthday) => {
    if (!birthday) return "N/A";
    const age = new Date().getFullYear() - new Date(birthday).getFullYear();
    return `${age} tuổi`;
  };

  useEffect(() => {
    const fetchParentInfo = async () => {
      try {
        setLoadingData(true);
        const res = await phuHuynhAPI.getProfile();
        if (res.status === "success") {
          setParentData(res.data);
        }

        const dashRes = await phuHuynhAPI.getDashboardData();
        if (dashRes.status === "success") {
          setDashboardData(dashRes.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin phụ huynh:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchParentInfo();
  }, [user]);

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "children", label: "Con của tôi", icon: Users },
    { id: "tutors", label: "Gia sư của con", icon: GraduationCap },
    { id: "find-tutor", label: "Tìm gia sư", icon: Search },
    { id: "dang-ky-lop", label: "Tìm & Đăng Ký Lớp", icon: BookOpen },
    { id: "schedule", label: "Lịch học", icon: Calendar },
    { id: "requests", label: "Yêu cầu hỗ trợ", icon: ClipboardList },
    { id: "payments", label: "Thanh toán", icon: CreditCard },
    { id: "profile", label: "Hồ sơ", icon: UserCircle },
  ];

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.id === activeMenu);
    return item ? item.label : "Tổng quan";
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <DashboardContent
            children={parentData?.hoc_sinh}
            tutors={dashboardData.tutors}
            upcomingClasses={dashboardData.upcoming_classes}
            loading={loadingData}
            calculateAge={calculateAge}
            onViewDetail={(id) => setSelectedChildId(id)}
          />
        );
      case "children":
        if (selectedChildId) {
          return (
            <StudentDetailView 
              studentId={selectedChildId} 
              onBack={() => setSelectedChildId(null)} 
            />
          );
        }
        return (
          <ChildrenContent
            children={parentData?.hoc_sinh}
            loading={loadingData}
            calculateAge={calculateAge}
            onViewDetail={(id) => setSelectedChildId(id)}
          />
        );
      case "tutors":
        return <TutorsContent />;
      case "find-tutor":
        return <FindTutorContent />;
      case "dang-ky-lop":
        return <DangKyLopManagement user={user} />;
      case "schedule":
        return <LichHocManagement user={user} />;
      case "requests":
        return <YeuCauManagement user={user} />;
      case "payments":
        return (
          <PlaceholderContent
            title="Thanh toán"
            description="Quản lý thanh toán học phí"
          />
        );
      case "profile":
        return <ProfileContent initialData={parentData} />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      showEditProfile={showEditProfile}
      setShowEditProfile={setShowEditProfile}
      menuItems={menuItems}
      activeItem={activeMenu}
      onMenuClick={setActiveMenu}
      pageTitle={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

// Dashboard Overview Content
function DashboardContent({ children, tutors, upcomingClasses, loading, calculateAge, onViewDetail }) {
  return (
    <div className="space-y-6">
      {/* Children Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children?.slice(0, 1).map((child) => (
          <ChildCard
            key={child.hoc_sinh_id}
            name={child.ho_ten}
            grade={`Khối ${child.khoi_lop}`}
            age={calculateAge(child.ngay_sinh)}
            subjects={child.subjects_count || 0}
            subjectsList={child.subjects_list}
            sessions={child.sessions_count || 0}
            initial={child.ho_ten?.charAt(0).toUpperCase()}
            gradient="from-pink-400 to-purple-400"
            showDetails={true}
            onViewDetail={() => onViewDetail(child.hoc_sinh_id)}
          />
        ))}

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
          <h3 className="font-bold text-gray-800">Gia sư hiện tại</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Xem tất cả
          </button>
        </div>
        <div className="space-y-3">
          {tutors && tutors.length > 0 ? (
            tutors.map((tutor) => (
              <TutorItem
                key={tutor.gia_su_id}
                name={tutor.ho_ten}
                subject={tutor.chuyen_mon || "Gia sư"}
                rating={tutor.diem_danh_gia_trung_binh || "0"}
                experience={tutor.kinh_nghiem || "N/A"}
                initial={tutor.ho_ten?.charAt(0).toUpperCase()}
                gradient="from-blue-500 to-indigo-500"
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm italic py-4 text-center">Chưa có gia sư nào đang giảng dạy.</p>
          )}
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4"> Lịch học sắp tới</h3>
        <div className="space-y-3">
          {upcomingClasses && upcomingClasses.length > 0 ? (
            upcomingClasses.map((cls) => (
              <UpcomingClass
                key={cls.lich_hoc_id}
                subject={cls.ten_mon_hoc}
                tutor={cls.ten_gia_su}
                time={`${new Date(cls.ngay_hoc).toLocaleDateString("vi-VN")}, ${cls.gio_bat_dau.substring(0, 5)} - ${cls.gio_ket_thuc.substring(0, 5)}`}
                child={cls.ten_hoc_sinh}
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm italic py-4 text-center">Không có lịch học nào sắp tới.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Children Content
function ChildrenContent({ children, loading, calculateAge, onViewDetail }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
          + Thêm con
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children?.map((child, index) => (
          <ChildCard
            key={child.hoc_sinh_id}
            name={child.ho_ten}
            grade={`Khối ${child.khoi_lop}`}
            age={calculateAge(child.ngay_sinh)}
            subjects={child.subjects_count || 0}
            subjectsList={child.subjects_list}
            sessions={child.sessions_count || 0}
            initial={child.ho_ten?.charAt(0).toUpperCase()}
            gradient={index % 2 === 0 ? "from-pink-400 to-purple-400" : "from-blue-400 to-indigo-400"}
            showDetails={true}
            onViewDetail={() => onViewDetail(child.hoc_sinh_id)}
          />
        ))}
      </div>
    </div>
  );
}

// Tutors Content
function TutorsContent() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await phuHuynhAPI.getMyTutors();
        if (res.status === "success") setTutors(res.data);
      } catch (err) {
        console.error("Lỗi tải gia sư:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-6">Gia sư của các con</h3>
        {tutors.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic">Chưa có gia sư nào đang giảng dạy.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutors.map((tutor) => (
              <TutorDetailCard
                key={`${tutor.gia_su_id}-${tutor.lop_hoc_id}`}
                name={tutor.ho_ten}
                subject={tutor.ten_mon_hoc}
                rating={tutor.diem_danh_gia_trung_binh}
                experience={tutor.kinh_nghiem}
                child={tutor.ten_hoc_sinh}
                schedule={`Khối lớp ${tutor.khoi_lop}`}
                fee={`${parseInt(tutor.gia_moi_buoi).toLocaleString('vi-VN')}đ/buổi`}
                initial={tutor.ho_ten?.charAt(0).toUpperCase()}
                gradient="from-blue-500 to-indigo-500"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Find Tutor Content
function FindTutorContent() {
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex gap-2">
          <Search />
          Tìm gia sư phù hợp
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Môn học
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Chọn môn học</option>
              <option>Toán</option>
              <option>Lý</option>
              <option>Hóa</option>
              <option>Tiếng Anh</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lớp
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khu vực
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Chọn khu vực</option>
              <option>Quận 1</option>
              <option>Quận 3</option>
              <option>Quận 7</option>
              <option>Bình Thạnh</option>
            </select>
          </div>
          <div>
            <button className="w-full px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium active:scale-[0.98]">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Gia sư phù hợp</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TutorSearchCard
            name="Nguyễn Văn Đức"
            subjects={["Toán", "Lý"]}
            rating="4.9"
            experience="6 năm"
            fee="350.000đ/buổi"
            location="Quận 1, 3, 7"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
        </div>
      </div>
    </div>
  );
}

// Child Card Component
function ChildCard({
  name,
  grade,
  age,
  subjects,
  subjectsList,
  sessions,
  initial,
  gradient,
  showDetails = false,
  onViewDetail,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold`}
        >
          {initial}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg">{name}</p>
          <p className="text-gray-500">
            {grade} • {age}
          </p>
          {subjectsList && (
            <p className="text-xs text-blue-600 font-medium mt-1 italic">
              Đang học: {subjectsList}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xl font-bold text-blue-600">{subjects}</p>
          <p className="text-xs text-gray-500">Môn học</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3">
          <p className="text-xl font-bold text-purple-600">{sessions}</p>
          <p className="text-xs text-gray-500">Buổi học</p>
        </div>
      </div>
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button 
            onClick={onViewDetail}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Xem chi tiết
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
            Chỉnh sửa
          </button>
        </div>
      )}
    </div>
  );
}

// Tutor Item Component
function TutorItem({ name, subject, rating, experience, initial, gradient }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <div
        className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white font-bold`}
      >
        {initial}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-gray-500 text-sm">
          {subject} • ⭐ {rating} • {experience} kinh nghiệm
        </p>
      </div>
      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium">
        Nhắn tin
      </button>
    </div>
  );
}

// Tutor Detail Card Component
function TutorDetailCard({
  name,
  subject,
  rating,
  experience,
  child,
  schedule,
  fee,
  initial,
  gradient,
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-4 mb-3">
        <div
          className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xl`}
        >
          {initial}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{name}</p>
          <p className="text-gray-500 text-sm">
            {subject} • ⭐ {rating} • {experience} kinh nghiệm
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Đang dạy
        </span>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-sm">
        <p className="text-gray-600">
          <strong>Dạy cho:</strong> {child}
        </p>
        <p className="text-gray-600">
          <strong>Lịch:</strong> {schedule}
        </p>
        <p className="text-gray-600">
          <strong>Học phí:</strong> {fee}
        </p>
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
  );
}

// Tutor Search Card Component
function TutorSearchCard({
  name,
  subjects,
  rating,
  experience,
  fee,
  location,
}) {
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
              <span
                key={idx}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p>
          ⭐ {rating} • {experience} kinh nghiệm
        </p>
        <p>📍 {location}</p>
        <p className="text-green-600 font-medium">{fee}</p>
      </div>
      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
        Liên hệ ngay
      </button>
    </div>
  );
}

// Profile Content Component
function ProfileContent({ initialData }) {
  const [profile, setProfile] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await phuHuynhAPI.getProfile();
        if (res.status === "success") {
          setProfile(res.data);
        } else {
          setError(res.message || "Không thể tải thông tin hồ sơ.");
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        setError(err.message || "Lỗi kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [initialData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
        {error}
      </div>
    );
  }

  const detailItems = [
    { icon: <UserCircle className="text-blue-500" />, label: "Họ và tên", value: profile?.ho_ten },
    { icon: <Mail className="text-red-500" />, label: "Email", value: profile?.email },
    { icon: <Phone className="text-green-500" />, label: "Số điện thoại", value: profile?.so_dien_thoai },
    { icon: <MapPin className="text-purple-500" />, label: "Địa chỉ", value: profile?.dia_chi || "Chưa cập nhật" },
    { 
      icon: <Calendar className="text-orange-500" />, 
      label: "Ngày đăng ký", 
      value: profile?.ngay_dang_ky ? new Date(profile.ngay_dang_ky).toLocaleDateString("vi-VN") : "N/A" 
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
              {profile?.ho_ten?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{profile?.ho_ten}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  profile?.trang_thai === 'da_duyet' ? 'bg-emerald-400 text-white' : 'bg-amber-400 text-white'
                }`}>
                  {profile?.trang_thai === 'da_duyet' ? 'Đã xác thực' : 'Chờ duyệt'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {detailItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="mt-1">{item.icon}</div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                <p className="text-gray-800 font-bold mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Student Detail View Component
function StudentDetailView({ studentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await phuHuynhAPI.getChildDetails(studentId);
        if (res.status === "success") setData(res.data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [studentId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!data) return <div className="text-center py-20">Không tìm thấy dữ liệu</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
        <ArrowLeft size={20} /> Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin & Lớp học */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Các lớp đang học</h3>
            <div className="space-y-3">
              {data.lop_hoc?.length > 0 ? data.lop_hoc.map(lop => (
                <div key={lop.lop_hoc_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">{lop.ten_mon_hoc} - Lớp {lop.khoi_lop}</p>
                    <p className="text-sm text-gray-500">Gia sư: {lop.gia_su_ten}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Đang học</span>
                </div>
              )) : <p className="text-gray-400 italic">Chưa đăng ký lớp nào</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <History size={20} className="text-blue-500" /> Lịch sử điểm danh gần đây
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b">
                    <th className="pb-3 px-2">Ngày</th>
                    <th className="pb-3 px-2">Lớp</th>
                    <th className="pb-3 px-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.diem_danh?.map(dd => (
                    <tr key={dd.diem_danh_id} className="text-sm">
                      <td className="py-3 px-2 font-medium">{new Date(dd.ngay_hoc).toLocaleDateString('vi-VN')}</td>
                      <td className="py-3 px-2">{dd.ten_mon_hoc}</td>
                      <td className="py-3 px-2">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                          dd.tinh_trang === 'co_mat' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {dd.tinh_trang === 'co_mat' ? 'Có mặt' : 'Vắng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin cá nhân học sinh */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
                {data.ho_ten?.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{data.ho_ten}</h2>
              <p className="text-blue-600 font-bold bg-blue-50 inline-block px-4 py-1 rounded-full text-xs mt-2 border border-blue-100">
                Mã học sinh: #{data.hoc_sinh_id}
              </p>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ngày sinh</p>
                <p className="text-gray-800 font-bold text-lg">{new Date(data.ngay_sinh).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Trình độ</p>
                <p className="text-gray-800 font-bold text-lg">Khối lớp {data.khoi_lop}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upcoming Class Component
function UpcomingClass({ subject, tutor, time, child }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
        <span className="text-2xl">📚</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">
          {subject} - {child}
        </p>
        <p className="text-gray-500 text-sm">
          {tutor} • {time}
        </p>
      </div>
    </div>
  );
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
  );
}
