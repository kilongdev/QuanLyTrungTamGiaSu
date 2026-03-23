import { useState, useEffect } from "react";
import DashboardLayout from "../Layouts/DashboardLayout";
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
} from "lucide-react"; // Đã thêm BookOpen
import YeuCauManagement from "../components/YeuCauManagement";
import LichHocManagement from "../components/LichHocManagement";
import DangKyLopManagement from "../components/DangKyLopManagement";
import { cn } from "@/lib/utils";

export default function PhuHuynhDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState(
    () => localStorage.getItem("phuhuynh_active_item") || "dashboard",
  );

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    localStorage.setItem("phuhuynh_active_item", menuId);
  };

  useEffect(() => {
    // Log token để kiểm tra
    const token = localStorage.getItem("token");
    console.log("=== PHỤ HUYNH DASHBOARD ===");
    console.log("User:", user);
    console.log("Token:", token);
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
        return <DashboardContent />;
      case "children":
        return <ChildrenContent />;
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
        return (
          <PlaceholderContent
            title="Hồ sơ"
            description="Cập nhật thông tin cá nhân"
          />
        );
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
      onMenuClick={handleMenuClick}
      pageTitle={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  );
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
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Xem tất cả
          </button>
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
  );
}

// Children Content
function ChildrenContent() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">
          + Thêm con
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
  );
}

// Tutors Content
function TutorsContent() {
  // return (
  //   <div className="space-y-6">
  //     <div className="bg-white rounded-2xl shadow-sm p-6">
  //       <h3 className="font-bold text-gray-800 mb-4">Danh sách gia sư</h3>
  //       <div className="space-y-4">
  //         <TutorDetailCard
  //           name="Trần Minh Tuấn"
  //           subject="Toán"
  //           rating="4.9"
  //           experience="5 năm"
  //           child="An"
  //           schedule="Thứ 2, 4, 6 - 08:00"
  //           fee="300.000đ/buổi"
  //           initial="T"
  //           gradient="from-blue-500 to-purple-500"
  //         />
  //         <TutorDetailCard
  //           name="Lê Thị Hương"
  //           subject="Tiếng Anh"
  //           rating="4.8"
  //           experience="3 năm"
  //           child="An"
  //           schedule="Thứ 3, 5 - 15:00"
  //           fee="250.000đ/buổi"
  //           initial="H"
  //           gradient="from-green-500 to-teal-500"
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className=" w-full mx-auto space-y-6 p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-2xl text-slate-800">
            Danh sách gia sư
          </h3>
          <span className="text-sm text-slate-400 font-medium">
            2 gia sư đang hoạt động
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TutorDetailCard
            name="Trần Minh Tuấn"
            subject="Toán"
            rating="4.9"
            experience="5 năm"
            child="An"
            schedule="Thứ 2, 4, 6 - 08:00"
            fee="300.000đ/buổi"
            initial="T"
            gradient="from-blue-500 to-indigo-600"
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
            gradient="from-emerald-400 to-teal-500"
          />
        </div>
      </div>
    </div>
  );
}

// Find Tutor Content
function FindTutorContent() {
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6 ">
        <h3 className="font-bold text-gray-800 mb-4 flex gap-1">
          <Search size={22} />
          Tìm gia sư phù hợp
        </h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-12 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Môn học
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
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
              <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Chọn lớp</option>
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
              <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Chọn khu vực</option>
                <option>Quận 1</option>
                <option>Quận 3</option>
                <option>Quận 7</option>
                <option>Bình Thạnh</option>
              </select>
            </div>

            <div>
              <button className="w-full h-[42px] bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md active:scale-[0.99]">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Danh sách các gia sư</h3>
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
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
          />
          <TutorSearchCard
            name="Phạm Thị Mai"
            subjects={["Toán"]}
            rating="4.7"
            experience="4 năm"
            fee="280.000đ/buổi"
            location="Quận 3, Bình Thạnh"
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
  avgScore,
  sessions,
  initial,
  gradient,
  showDetails = false,
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

// // Tutor Detail Card Component
// function TutorDetailCard({
//   name,
//   subject,
//   rating,
//   experience,
//   child,
//   schedule,
//   fee,
//   initial,
//   gradient,
// }) {
//   return (
//     <div className="p-4 border border-gray-200 rounded-xl">
//       <div className="flex items-center gap-4 mb-3">
//         <div
//           className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xl`}
//         >
//           {initial}
//         </div>
//         <div className="flex-1">
//           <p className="font-bold text-gray-800">{name}</p>
//           <p className="text-gray-500 text-sm">
//             {subject} • ⭐ {rating} • {experience} kinh nghiệm
//           </p>
//         </div>
//         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
//           Đang dạy
//         </span>
//       </div>
//       <div className="bg-gray-50 rounded-xl p-3 text-sm">
//         <p className="text-gray-600">
//           <strong>Dạy cho:</strong> {child}
//         </p>
//         <p className="text-gray-600">
//           <strong>Lịch:</strong> {schedule}
//         </p>
//         <p className="text-gray-600">
//           <strong>Học phí:</strong> {fee}
//         </p>
//       </div>
//       <div className="mt-3 flex gap-2">
//         <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
//           Nhắn tin
//         </button>
//         <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
//           Đánh giá
//         </button>
//       </div>
//     </div>
//   );
// }
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
    <div className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Thông tin chính & Trạng thái */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar với Ring trắng tạo độ nổi khối */}
          <div
            className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner border-4 border-white`}
          >
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg leading-tight">
              {name}
            </h4>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
              <span>{subject}</span>
              <span className="text-amber-500 font-medium">★ {rating}</span>
              <span className="text-slate-300">|</span>
              <span>{experience} kinh nghiệm</span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold tracking-wide uppercase">
          Đang dạy
        </span>
      </div>

      {/* Body: Chi tiết lớp học */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
        <p className="text-slate-500">
          Dạy cho:{" "}
          <span className="font-semibold text-slate-800 ml-1">{child}</span>
        </p>
        <p className="text-slate-500 text-right sm:text-left">
          Lịch:{" "}
          <span className="font-semibold text-slate-800 ml-1">{schedule}</span>
        </p>
        <div className="col-span-full pt-2 mt-2 border-t border-slate-200/60">
          <p className="text-blue-600 font-bold text-base">Học phí: {fee}</p>
        </div>
      </div>

      {/* Footer: Hành động */}
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
        <button className="flex-[2] px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all text-sm font-semibold">
          Nhắn tin
        </button>
        <button className="flex-1 px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-300 hover:border-slate-300 transition-all text-sm font-semibold">
          Đánh giá
        </button>
      </div>
    </div>
  );
}

// Tutor Search Card Component
// function TutorSearchCard({
//   name,
//   subjects,
//   rating,
//   experience,
//   fee,
//   location,
// }) {
//   return (
//     <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
//       <div className="flex items-center gap-3 mb-3">
//         <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
//           {name.charAt(0)}
//         </div>
//         <div className="flex-1">
//           <p className="font-bold text-gray-800">{name}</p>
//           <div className="flex gap-1">
//             {subjects.map((sub, idx) => (
//               <span
//                 key={idx}
//                 className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
//               >
//                 {sub}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//       <div className="text-sm text-gray-600 space-y-1 mb-3">
//         <p>
//           ⭐ {rating} • {experience} kinh nghiệm
//         </p>
//         <p>📍 {location}</p>
//         <p className="text-green-600 font-medium">{fee}</p>
//       </div>
//       <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
//         Liên hệ ngay
//       </button>
//     </div>
//   );
// }

function TutorSearchCard({
  name,
  subjects,
  rating,
  experience,
  fee,
  location,
  // gradient = "from-blue-500 to-indigo-600",
}) {
  const getAvatarInitials = (name) => {
    if (!name || typeof name !== "string") return "";

    const words = name.trim().split(/\s+/);
    const lastWord = words[words.length - 1];

    return lastWord.charAt(0).toUpperCase();
  };
  return (
    <div className="group bg-white p-5 border border-slate-100 rounded-2xl shadow-sm  transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* <div
          className={`shrink-0 w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white transition-transform`}
        >
          {name.charAt(0)}
        </div> */}
        <div className=" text-black w-14 h-14 rounded-full flex items-center justify-center font-semibold text-2xl shadow-md mb-5 ring-1 ring-gray-400">
          {getAvatarInitials(name)}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded-lg">
              ⭐ {rating}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {/* Chuyên môn:{" "} */}
            {subjects.map((sub, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold uppercase tracking-wider border border-blue-100"
              >
                {sub}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <div
              className={cn(
                "space-y-2 text-sm text-slate-500 flex items-center gap-[2px]",
                "before:content-['•'] before:text-lg before:leading-none",
              )}
            >
              <span className="text-slate-400"></span>
              <span>{experience} kinh nghiệm</span>
            </div>
            <div
              className={cn(
                "space-y-2 text-sm text-slate-500 flex items-center gap-[2px]",
                "before:content-['•'] before:text-lg before:leading-none",
              )}
            >
              <span className="text-slate-400"></span>
              <span className="truncate">{location}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#ddd] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold">
                Học phí
              </p>
              <p className="text-emerald-600 font-extrabold text-lg leading-none">
                {fee}
                {/* <span className="text-[10px] font-medium text-slate-400 ml-0.5">
                  /buổi
                </span> */}
              </p>
            </div>

            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 font-bold text-sm">
              Liên hệ ngay
            </button>
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
          👨‍🏫 {tutor} • {time}
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
