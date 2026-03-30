import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  LogOut,
  X,
  CheckCheck,
  Calendar,
  User,
  Tag,
  Lock,
  ChevronDown,
} from "lucide-react";
import { thongBaoAPI } from "@/api/thongbaoApi";

export default function DashboardNavbar({
  user,
  onLogout,
  pageTitle,
  sidebarCollapsed,
  onToggleSidebar,
  onEditProfile,
  onChangePassword,
}) {
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Lấy role type cho API
  const getUserType = () => {
    switch (user?.role) {
      case "admin":
        return "admin";
      case "gia_su":
        return "gia_su";
      case "phu_huynh":
        return "phu_huynh";
      default:
        return user?.role;
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await thongBaoAPI.getMyNotifications();

      if (response.status === "success" && response.data) {
        setNotifications(response.data);
        const unread = response.data.filter(
          (n) => n.da_doc === 0 || n.da_doc === false,
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      await thongBaoAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.thong_bao_id === notificationId
            ? { ...n, da_doc: 1 }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  // Click vào thông báo để xem chi tiết
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.da_doc) {
      handleMarkAsRead(notification.thong_bao_id);
    }
    setShowDropdown(false);
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setSelectedNotification(null);
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await thongBaoAPI.markAllAsRead(user.id, getUserType());
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, da_doc: 1 })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
    }
  };

  // User menu handlers
  const handleEditProfile = () => {
    setShowUserMenu(false);
    if (onEditProfile) onEditProfile();
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    if (onChangePassword) onChangePassword();
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    onLogout();
  };

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load notifications khi mount và user có id
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };
  return (
    <header className="bg-gray-50 fixed top-0 left-0 right-0 z-50">
      <div className="h-16 flex items-center justify-between">
        {/* Left - Toggle Button & Logo */}
        <div className="flex items-center h-full">
          {/* Toggle button container - căn với sidebar */}
          <div className="w-20 flex justify-center flex-shrink-0">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          {/* Logo - luôn hiển thị */}
          <div className="pl-2">
            <img
              src="https://d1reana485161v.cloudfront.net/i/logo_findtutors_v3.svg"
              alt="FindTutors"
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Right - User info & actions */}
        <div className="flex items-center gap-4 pr-4">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                  <h3 className="font-semibold text-gray-800">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Bell className="w-10 h-10 mb-2 text-gray-300" />
                      <p className="text-sm">Không có thông báo</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.thong_bao_id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.da_doc
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                              !notification.da_doc
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.tieu_de}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                              {notification.noi_dung}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.ngay_tao)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info & Dropdown Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-300 relative">
            <div className="text-right">
              <p className="font-semibold text-gray-800 text-sm">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === "phu_huynh"
                  ? "Phụ huynh"
                  : user?.role === "gia_su"
                    ? "Gia sư"
                    : user?.role === "admin"
                      ? "Quản trị viên"
                      : user?.role}
              </p>
            </div>

            {/* User Menu Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  Sửa thông tin cá nhân
                </button>
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  Thay đổi mật khẩu
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {selectedNotification.tieu_de}
                    </h3>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                        !selectedNotification.da_doc
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-green-400 text-green-900"
                      }`}
                    >
                      {!selectedNotification.da_doc
                        ? "Chưa đọc"
                        : "Đã đọc"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Nội dung */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Nội dung
                </label>
                <p className="mt-1 text-gray-800 leading-relaxed">
                  {selectedNotification.noi_dung}
                </p>
              </div>

              {/* Thông tin thêm */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Thời gian</p>
                    <p className="text-sm font-medium">
                      {formatTime(selectedNotification.ngay_tao)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Loại</p>
                    <p className="text-sm font-medium capitalize">
                      {selectedNotification.loai_thong_bao === "he_thong"
                        ? "Hệ thống"
                        : selectedNotification.loai_thong_bao === "dang_ky"
                          ? "Đăng ký"
                          : selectedNotification.loai_thong_bao === "yeu_cau"
                            ? "Yêu cầu"
                            : selectedNotification.loai_thong_bao}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-4 flex justify-end gap-2">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
}
