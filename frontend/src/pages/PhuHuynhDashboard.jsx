import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../Layouts/DashboardLayout";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  UserCircle,
  ClipboardList,
  BookOpen,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import YeuCauManagement from "../components/YeuCauManagement";
import LichHocManagement from "../components/LichHocManagement";
import DangKyLopManagement from "../components/DangKyLopManagement";
import { phuHuynhAPI } from "../api/phuHuynhApi";

const MENU_ITEMS = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "children", label: "Con của tôi", icon: Users },
  { id: "tutors", label: "Gia sư của con", icon: GraduationCap },
  { id: "dang-ky-lop", label: "Tìm & Đăng Ký Lớp", icon: BookOpen },
  { id: "schedule", label: "Lịch học", icon: Calendar },
  { id: "requests", label: "Yêu cầu hỗ trợ", icon: ClipboardList },
  { id: "payments", label: "Thanh toán", icon: CreditCard },
  { id: "profile", label: "Hồ sơ", icon: UserCircle },
];

const VALID_MENU_IDS = new Set(MENU_ITEMS.map((item) => item.id));

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function calcAge(dateStr) {
  if (!dateStr) return "-";
  const dob = new Date(dateStr);
  if (Number.isNaN(dob.getTime())) return "-";

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 0 ? `${age} tuổi` : "-";
}

export default function PhuHuynhDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState(() => {
    const saved = localStorage.getItem("phuhuynh_active_item") || "dashboard";
    return VALID_MENU_IDS.has(saved) ? saved : "dashboard";
  });
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [tutorsData, setTutorsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [profileData, setProfileData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",
  });

  const [loading, setLoading] = useState({
    core: false,
    payments: false,
    profile: false,
    saveProfile: false,
  });

  const [loaded, setLoaded] = useState({
    payments: false,
    profile: false,
  });

  const parentId = useMemo(
    () => user?.id || user?.phu_huynh_id || user?.tai_khoan_id,
    [user],
  );

  const handleMenuClick = (menuId) => {
    if (!VALID_MENU_IDS.has(menuId)) return;
    setActiveMenu(menuId);
    localStorage.setItem("phuhuynh_active_item", menuId);
  };

  const getPageTitle = () => {
    const item = MENU_ITEMS.find((m) => m.id === activeMenu);
    return item ? item.label : "Tổng quan";
  };

  useEffect(() => {
    if (!parentId) return;

    const fetchCoreData = async () => {
      try {
        setLoading((prev) => ({ ...prev, core: true }));
        const [dashboardRes, childrenRes, tutorsRes] = await Promise.all([
          phuHuynhAPI.getDashboard(parentId),
          phuHuynhAPI.getChildren(parentId),
          phuHuynhAPI.getTutors(parentId),
        ]);

        setDashboardData(dashboardRes?.data || null);
        setChildrenData(childrenRes?.data || []);
        setTutorsData(tutorsRes?.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu phụ huynh:", error);
        toast.error(error?.message || "Không thể tải dữ liệu phụ huynh");
      } finally {
        setLoading((prev) => ({ ...prev, core: false }));
      }
    };

    fetchCoreData();
  }, [parentId]);

  useEffect(() => {
    if (!parentId || activeMenu !== "payments" || loaded.payments) return;

    const fetchPayments = async () => {
      try {
        setLoading((prev) => ({ ...prev, payments: true }));
        const response = await phuHuynhAPI.getPayments(parentId);
        setPaymentsData(response?.data || []);
        setLoaded((prev) => ({ ...prev, payments: true }));
      } catch (error) {
        console.error("Lỗi tải học phí:", error);
        toast.error(error?.message || "Không thể tải danh sách học phí");
      } finally {
        setLoading((prev) => ({ ...prev, payments: false }));
      }
    };

    fetchPayments();
  }, [activeMenu, loaded.payments, parentId]);

  useEffect(() => {
    if (!parentId || activeMenu !== "profile" || loaded.profile) return;

    const fetchProfile = async () => {
      try {
        setLoading((prev) => ({ ...prev, profile: true }));
        const response = await phuHuynhAPI.getProfile(parentId);
        const profile = response?.data || {};

        setProfileData({
          ho_ten: profile.ho_ten || "",
          email: profile.email || user?.email || "",
          so_dien_thoai: profile.so_dien_thoai || "",
          dia_chi: profile.dia_chi || "",
        });
        setLoaded((prev) => ({ ...prev, profile: true }));
      } catch (error) {
        console.error("Lỗi tải hồ sơ phụ huynh:", error);
        toast.error(error?.message || "Không thể tải hồ sơ");
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    };

    fetchProfile();
  }, [activeMenu, loaded.profile, parentId, user?.email]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileData.ho_ten.trim() || !profileData.email.trim()) {
      toast.error("Họ tên và email là bắt buộc");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, saveProfile: true }));
      const response = await phuHuynhAPI.updateProfile(parentId, profileData);
      const updatedProfile = response?.data || profileData;

      setProfileData({
        ho_ten: updatedProfile.ho_ten || "",
        email: updatedProfile.email || "",
        so_dien_thoai: updatedProfile.so_dien_thoai || "",
        dia_chi: updatedProfile.dia_chi || "",
      });

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: updatedProfile.ho_ten || storedUser.name,
            email: updatedProfile.email || storedUser.email,
          }),
        );
      }

      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error(error?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setLoading((prev) => ({ ...prev, saveProfile: false }));
    }
  };

  const paymentSummary = useMemo(() => {
    return paymentsData.reduce(
      (acc, item) => {
        const amount = Number(item.so_tien || 0);
        const status = item.trang_thai_thanh_toan;

        if (status === "da_thanh_toan") acc.paid += amount;
        if (status === "chua_thanh_toan") acc.unpaid += amount;
        if (status === "qua_han") acc.overdue += amount;

        return acc;
      },
      { paid: 0, unpaid: 0, overdue: 0 },
    );
  }, [paymentsData]);

  const renderContent = () => {
    if (loading.core && ["dashboard", "children", "tutors"].includes(activeMenu)) {
      return (
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-sm p-14 flex items-center justify-center text-gray-600 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải dữ liệu...
        </div>
      );
    }

    switch (activeMenu) {
      case "dashboard":
        return (
          <DashboardContent
            dashboardData={dashboardData}
            childrenData={childrenData}
            tutorsData={tutorsData}
            onNavigate={handleMenuClick}
          />
        );
      case "children":
        return <ChildrenContent childrenData={childrenData} />;
      case "tutors":
        return <TutorsContent tutorsData={tutorsData} />;
      case "dang-ky-lop":
        return <DangKyLopManagement user={user} />;
      case "schedule":
        return <LichHocManagement user={user} />;
      case "requests":
        return <YeuCauManagement user={user} />;
      case "payments":
        return (
          <PaymentsContent
            loading={loading.payments}
            paymentsData={paymentsData}
            paymentSummary={paymentSummary}
          />
        );
      case "profile":
        return (
          <ProfileContent
            loading={loading.profile}
            saving={loading.saveProfile}
            profileData={profileData}
            onChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
          />
        );
      default:
        return (
          <DashboardContent
            dashboardData={dashboardData}
            childrenData={childrenData}
            tutorsData={tutorsData}
            onNavigate={handleMenuClick}
          />
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      showEditProfile={showEditProfile}
      setShowEditProfile={setShowEditProfile}
      menuItems={MENU_ITEMS}
      activeItem={activeMenu}
      onMenuClick={handleMenuClick}
      pageTitle={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function DashboardContent({ dashboardData, childrenData, tutorsData, onNavigate }) {
  const stats = [
    {
      label: "Con đang theo học",
      value: dashboardData?.total_children || 0,
      color: "text-gray-900",
      bg: "bg-white",
      clickTo: "children",
    },
    {
      label: "Lớp đã đăng ký",
      value: dashboardData?.total_classes || 0,
      color: "text-gray-900",
      bg: "bg-white",
      clickTo: "dang-ky-lop",
    },
    {
      label: "Gia sư của con",
      value: dashboardData?.total_tutors || 0,
      color: "text-gray-900",
      bg: "bg-white",
      clickTo: "tutors",
    },
    {
      label: "Khoản cần thanh toán",
      value: dashboardData?.unpaid_count || 0,
      color: "text-gray-900",
      bg: "bg-white",
      clickTo: "payments",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.clickTo)}
            className={`text-left rounded-xl p-5 border border-gray-200 shadow-sm hover:bg-gray-50 transition ${item.bg}`}
          >
            <p className="text-sm text-gray-600">{item.label}</p>
            <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Con của tôi</h3>
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => onNavigate("children")}
            >
              Xem tất cả
            </button>
          </div>

          {childrenData.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu học sinh.</p>
          ) : (
            <div className="space-y-3">
              {childrenData.slice(0, 3).map((child) => (
                <div
                  key={child.hoc_sinh_id}
                  className="p-4 rounded-xl border border-gray-100 bg-white"
                >
                  <p className="font-semibold text-gray-800">{child.ho_ten}</p>
                  <p className="text-sm text-gray-500">
                    Lớp {child.khoi_lop || "-"} • {calcAge(child.ngay_sinh)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {child.so_lop || 0} lớp • {child.so_buoi_hoc || 0} buổi
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Gia sư của con</h3>
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => onNavigate("tutors")}
            >
              Xem tất cả
            </button>
          </div>

          {tutorsData.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có gia sư đang giảng dạy.</p>
          ) : (
            <div className="space-y-3">
              {tutorsData.slice(0, 3).map((tutor) => (
                <div
                  key={tutor.gia_su_id}
                  className="p-4 rounded-xl border border-gray-100 bg-white"
                >
                  <p className="font-semibold text-gray-800">{tutor.ho_ten}</p>
                  <p className="text-sm text-gray-500">{tutor.mon_hoc_giang_day || "Chưa cập nhật môn"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Phụ trách: {tutor.hoc_sinh_phu_trach || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Lịch học sắp tới</h3>

        {dashboardData?.upcoming_schedule?.length ? (
          <div className="space-y-3">
            {dashboardData.upcoming_schedule.map((schedule, index) => (
              <div
                key={`${schedule.ngay_hoc}-${schedule.gio_bat_dau}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {schedule.ten_mon_hoc} - {schedule.ten_hoc_sinh}
                  </p>
                  <p className="text-sm text-gray-500">
                    {schedule.ten_lop} • Gia sư: {schedule.ten_gia_su}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{formatDate(schedule.ngay_hoc)}</p>
                  <p>
                    {schedule.gio_bat_dau?.slice(0, 5)} - {schedule.gio_ket_thuc?.slice(0, 5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Không có lịch học sắp tới.</p>
        )}
      </div>
    </div>
  );
}

function ChildrenContent({ childrenData }) {
  if (!childrenData.length) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
        Chưa có dữ liệu học sinh.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {childrenData.map((child) => (
        <div key={child.hoc_sinh_id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-lg">{child.ho_ten}</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              Lớp {child.khoi_lop || "-"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-xl font-bold text-gray-900">{child.so_lop || 0}</p>
              <p className="text-xs text-gray-500">Số lớp</p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-xl font-bold text-gray-900">{child.so_buoi_hoc || 0}</p>
              <p className="text-xs text-gray-500">Số buổi</p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-sm font-bold text-gray-900">{calcAge(child.ngay_sinh)}</p>
              <p className="text-xs text-gray-500">Tuổi</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            <strong>Môn học:</strong> {child.mon_hoc || "Chưa cập nhật"}
          </p>
        </div>
      ))}
    </div>
  );
}

function TutorsContent({ tutorsData }) {
  if (!tutorsData.length) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
        Chưa có gia sư đang phụ trách con của bạn.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tutorsData.map((tutor) => (
        <div key={tutor.gia_su_id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{tutor.ho_ten}</h3>
              <p className="text-sm text-gray-600 mt-1">{tutor.mon_hoc_giang_day || "Chưa cập nhật môn học"}</p>
              <p className="text-sm text-gray-500 mt-1">
                Phụ trách học sinh: {tutor.hoc_sinh_phu_trach || "-"}
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {tutor.so_lop || 0} lớp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-gray-500">SĐT</p>
              <p className="font-medium text-gray-800">{tutor.so_dien_thoai || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{tutor.email || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-gray-500">Đánh giá</p>
              <p className="font-medium text-gray-800">⭐ {Number(tutor.diem_danh_gia_trung_binh || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentsContent({ loading, paymentsData, paymentSummary }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Đang tải học phí...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 border border-gray-200 shadow-sm bg-white">
        <p className="text-sm text-gray-600">Tổng học phí</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {formatCurrency(paymentSummary.paid + paymentSummary.unpaid + paymentSummary.overdue)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Đã thanh toán: {formatCurrency(paymentSummary.paid)} • Cần thanh toán: {formatCurrency(paymentSummary.unpaid + paymentSummary.overdue)}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/80">
              <th className="py-3 px-2">Học sinh</th>
              <th className="py-3 px-2">Lớp</th>
              <th className="py-3 px-2">Số tiền</th>
              <th className="py-3 px-2">Đến hạn</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2">Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {paymentsData.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={6}>
                  Chưa có dữ liệu học phí.
                </td>
              </tr>
            ) : (
              paymentsData.map((item) => (
                <tr key={item.hoc_phi_id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 px-2 font-medium text-gray-800">{item.ten_hoc_sinh}</td>
                  <td className="py-3 px-2 text-gray-600">{item.ten_lop}</td>
                  <td className="py-3 px-2 text-gray-700">{formatCurrency(item.so_tien)}</td>
                  <td className="py-3 px-2 text-gray-600">{formatDate(item.ngay_den_han)}</td>
                  <td className="py-3 px-2">
                    <PaymentStatus status={item.trang_thai_thanh_toan} />
                  </td>
                  <td className="py-3 px-2 text-gray-600">{formatDate(item.ngay_thanh_toan)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// ĐÂY LÀ GIAO DIỆN HỒ SƠ PHỤ HUYNH MỚI
// ĐÃ XÓA GIỚI HẠN CHIỀU RỘNG ĐỂ FULL MÀN HÌNH NHƯ GIA SƯ
// ==========================================
function ProfileContent({ loading, saving, profileData, onChange, onSubmit }) {
  if (loading) {
    return (
      <div className="p-10 text-center flex justify-center h-full items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'PH';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all outline-none shadow-sm hover:border-gray-400";
  const labelClass = "block text-sm font-bold text-gray-800 mb-2";

  return (
    // Đã đổi từ "w-full pb-12 max-w-5xl mx-auto" thành "w-full pb-12"
    <div className="w-full pb-12">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative">
        
        {/* Banner Gradient Nhẹ Nhàng */}
        <div className="h-40 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100"></div>

        {/* Profile Header */}
        <div className="px-8 sm:px-12 relative -mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="flex items-end gap-6">
            {/* Avatar lồi */}
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold shrink-0">
              {getInitials(profileData.ho_ten)}
            </div>
            <div className="mb-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profileData.ho_ten || 'Tên Phụ Huynh'}</h2>
              <p className="text-gray-600 font-medium mt-1">{profileData.email}</p>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={saving} 
            className="mb-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap min-w-[160px]"
          >
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...</>
            ) : 'Lưu Hồ Sơ'}
          </button>
        </div>

        {/* Form Fields */}
        <div className="px-8 sm:px-12 pb-12 space-y-10">
          
          {/* Section 1 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Thông tin liên hệ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <label className={labelClass}>Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" name="ho_ten" value={profileData.ho_ten} onChange={onChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email (Cố định)</label>
                <input type="email" value={profileData.email} readOnly className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200`} />
              </div>
              <div>
                <label className={labelClass}>Số điện thoại</label>
                <input type="tel" name="so_dien_thoai" value={profileData.so_dien_thoai} onChange={onChange} placeholder="09xx xxx xxx" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Địa chỉ hiện tại</label>
                <input type="text" name="dia_chi" value={profileData.dia_chi} onChange={onChange} placeholder="Số nhà, tên đường, phường/xã..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* Section 2: Chú ý */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h4 className="font-bold text-blue-900 mb-2">Lưu ý từ Trung tâm</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Vui lòng đảm bảo thông tin số điện thoại và địa chỉ luôn được cập nhật chính xác. Trung tâm và Gia sư sẽ liên hệ với bạn qua các kênh này để trao đổi về tình hình học tập của con em.
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}

function PaymentStatus({ status }) {
  const map = {
    da_thanh_toan: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700" },
    chua_thanh_toan: { label: "Chưa thanh toán", className: "bg-amber-100 text-amber-700" },
    qua_han: { label: "Quá hạn", className: "bg-red-100 text-red-700" },
  };

  const current = map[status] || { label: "Không xác định", className: "bg-gray-100 text-gray-700" };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${current.className}`}>
      {current.label}
    </span>
  );
}
