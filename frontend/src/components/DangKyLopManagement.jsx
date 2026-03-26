import React, { useState, useEffect } from "react";
import {
  BookOpen,
  UserCheck,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  X,
  User,
  Search,
  GraduationCap,
  Users,
  Filter,
  SearchIcon,
  ClockIcon,
  BookCheck,
} from "lucide-react";
import { dangKyLopAPI } from "../api/dangKyLopApi";
import { lichHocAPI } from "../api/lichhocApi";
import { hocSinhAPI } from "../api/hocSinhApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DangKyLopManagement({ user }) {
  const [errors, setErrors] = useState({});

  const [dangKys, setDangKys] = useState([]);
  const [lopHocs, setLopHocs] = useState([]);
  const [hocSinhs, setHocSinhs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("tim_lop");
  const [showDangKyModal, setShowDangKyModal] = useState(false);
  const [selectedLop, setSelectedLop] = useState(null);
  const [selectedHocSinhId, setSelectedHocSinhId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");

  const [alertModal, setAlertModal] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  // State quản lý Modal Chi tiết dùng chung
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  useEffect(() => {
    if (showDangKyModal) {
      setSelectedHocSinhId("");
      setErrors({});
    }
  }, [showDangKyModal]);

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === "admin") {
        const res = await dangKyLopAPI.getAll();
        setDangKys(res?.data || []);
      } else if (user?.role !== "gia_su") {
        const phuHuynhId =
          user?.id || user?.phu_huynh_id || user?.tai_khoan_id || "1";

        if (activeTab === "lich_su") {
          const res = await dangKyLopAPI.getByPhuHuynh(phuHuynhId);
          setDangKys(res?.data || []);
        } else {
          const resLop = await lichHocAPI.getLopHocs();
          const availableClasses = (resLop?.data || []).filter(
            (l) =>
              (l.trang_thai === "sap_mo" || l.trang_thai === "dang_hoc") &&
              l.so_luong_hien_tai < l.so_luong_toi_da,
          );
          setLopHocs(availableClasses);

          const resHs = await hocSinhAPI.getByPhuHuynh(phuHuynhId);
          setHocSinhs(resHs?.data || []);
        }
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  // popup
  // const handleUpdateStatus = (id, trang_thai_moi) => {
  //   const actionName =
  //     trang_thai_moi === "da_duyet"
  //       ? "Duyệt"
  //       : trang_thai_moi === "tu_choi"
  //         ? "Từ chối"
  //         : "Hủy";
  //   setConfirmModal({
  //     show: true,
  //     message: `Bạn có chắc chắn muốn ${actionName} đơn đăng ký này?`,
  //     onConfirm: async () => {
  //       try {
  //         await dangKyLopAPI.updateStatus(id, trang_thai_moi);
  //         setConfirmModal({ show: false, message: "", onConfirm: null });
  //         setAlertModal({
  //           show: true,
  //           message: `Đã ${actionName} đơn thành công!`,
  //           type: "success",
  //         });
  //         fetchData();
  //       } catch (error) {
  //         setAlertModal({
  //           show: true,
  //           message: error.message || "Có lỗi xảy ra!",
  //           type: "error",
  //         });
  //       }
  //     },
  //   });
  // };

  // toast
  const handleUpdateStatus = (id, trang_thai_moi) => {
    const actionName =
      trang_thai_moi === "da_duyet"
        ? "Duyệt"
        : trang_thai_moi === "tu_choi"
          ? "Từ chối"
          : "Hủy";

    setConfirmModal({
      show: true,
      message: `Bạn có chắc chắn muốn ${actionName} đơn đăng ký này?`,
      onConfirm: async () => {
        setConfirmModal({ show: false, message: "", onConfirm: null });

        const loadingToast = toast.loading(
          `Đang ${actionName.toLowerCase()} đơn...`,
        );

        try {
          await dangKyLopAPI.updateStatus(id, trang_thai_moi);

          toast.success(`Đã ${actionName.toLowerCase()} đơn thành công!`, {
            id: loadingToast,
          });
          fetchData();
        } catch (error) {
          toast.error(error.message || "Có lỗi xảy ra!", { id: loadingToast });
        }
      },
    });
  };

  //   if (!selectedHocSinhId) {
  //     setAlertModal({
  //       show: true,
  //       message: "Vui lòng chọn học sinh để đăng ký!",
  //       type: "error",
  //     });
  //     return;
  //   }

  //   try {
  //     await dangKyLopAPI.create({
  //       hoc_sinh_id: selectedHocSinhId,
  //       lop_hoc_id: selectedLop.lop_hoc_id,
  //     });
  //     setShowDangKyModal(false);
  //     setAlertModal({
  //       show: true,
  //       message: "Đăng ký thành công! Vui lòng chờ trung tâm duyệt đơn.",
  //       type: "success",
  //     });
  //     setSelectedHocSinhId("");

  //     setActiveTab("lich_su");
  //   } catch (error) {
  //     setAlertModal({
  //       show: true,
  //       message: error.message || "Lỗi đăng ký!",
  //       type: "error",
  //     });
  //   }
  // };
  //toast
  const handleDangKySubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!selectedHocSinhId) {
      newErrors.selectedHocSinhId = "Vui lòng chọn học sinh!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const res = await dangKyLopAPI.create({
      hoc_sinh_id: selectedHocSinhId,
      lop_hoc_id: selectedLop.lop_hoc_id,
    });

    console.log("Res yêu cầu: ", res);

    if (!selectedHocSinhId || !selectedLop?.lop_hoc_id) {
      toast.error("Thiếu dữ liệu!");
      return;
    }

    if (res.status === "success") {
      toast.success("Đăng ký thành công!");

      setSelectedHocSinhId("");
      setErrors({});
      setShowDangKyModal(false);
      setActiveTab("lich_su");
    } else {
      toast.error(res.message || "Đăng ký thất bại!");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "cho_duyet":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-max">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case "da_duyet":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max">
            <CheckCircle size={12} /> Đã duyệt
          </span>
        );
      case "tu_choi":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 w-max">
            <XCircle size={12} /> Từ chối
          </span>
        );
      case "da_huy":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 flex items-center gap-1 w-max">
            <AlertTriangle size={12} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const filteredLopHocs = lopHocs.filter((lop) => {
    const searchLower = searchTerm.toLowerCase();
    const tenLop = lop.ten_lop ? lop.ten_lop.toLowerCase() : "";
    const monHoc = lop.ten_mon_hoc ? lop.ten_mon_hoc.toLowerCase() : "";
    const tenGiaSu = lop.ten_gia_su ? lop.ten_gia_su.toLowerCase() : "";

    return (
      tenLop.includes(searchLower) ||
      monHoc.includes(searchLower) ||
      tenGiaSu.includes(searchLower) ||
      String(lop.lop_hoc_id).includes(searchLower)
    );
  });

  if (user?.role === "gia_su") {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-2xl shadow-sm">
        Gia sư không có quyền thao tác trên module này. Vui lòng xem ở Danh sách
        lớp.
      </div>
    );
  }

  function renderPopups() {
    return (
      <>
        {confirmModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Xác nhận thao tác
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({
                      show: false,
                      message: "",
                      onConfirm: null,
                    })
                  }
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}

        {alertModal.show && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[70]">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${alertModal.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
              >
                {alertModal.type === "success" ? (
                  <CheckCircle size={32} />
                ) : (
                  <AlertTriangle size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {alertModal.type === "success" ? "Thành công" : "Lỗi"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{alertModal.message}</p>
              <button
                onClick={() =>
                  setAlertModal({ show: false, message: "", type: "success" })
                }
                className="w-full py-2 mt-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* MODAL XEM CHI TIẾT ĐƠN ĐĂNG KÝ DÙNG CHUNG CHO CẢ PHỤ HUYNH VÀ ADMIN */}
        {detailModal.show && detailModal.data && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-blue-900">
                  Chi tiết đăng ký
                </h3>
                <button
                  onClick={() => setDetailModal({ show: false, data: null })}
                  className="text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Mã đơn:</span>
                  <span className="font-bold text-gray-800">
                    #{detailModal.data.dang_ky_id}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Trạng thái:</span>
                  {getStatusBadge(detailModal.data.trang_thai)}
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Học sinh:</span>
                  <span className="font-medium text-gray-800">
                    {detailModal.data.ten_hoc_sinh}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Lớp:</span>
                  <span className="font-medium text-blue-600">
                    {detailModal.data.ten_lop ||
                      `Lớp #${detailModal.data.lop_hoc_id}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Môn học:</span>
                  <span className="font-medium text-gray-800">
                    {detailModal.data.ten_mon_hoc || "Đang cập nhật"}
                  </span>
                </div>

                {/* THÊM KHỐI LỚP VÀ GIA SƯ */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Khối lớp:</span>
                  <span className="font-medium text-gray-800">
                    {detailModal.data.khoi_lop || "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Gia sư:</span>
                  <span className="font-medium text-gray-800">
                    {detailModal.data.ten_gia_su || "Chưa phân công"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Số buổi:</span>
                  <span className="font-medium text-gray-800">
                    {detailModal.data.so_buoi_hoc
                      ? `${detailModal.data.so_buoi_hoc} buổi`
                      : "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Lịch học:</span>
                  <span className="font-medium text-gray-800">
                    {detailModal.data.lich_hoc_du_kien || "Chưa có lịch"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Học phí:</span>
                  <span className="font-bold text-red-600 text-base">
                    {detailModal.data.gia_toan_khoa
                      ? `${Number(detailModal.data.gia_toan_khoa).toLocaleString("vi-VN")} đ`
                      : "Đang cập nhật"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-500 text-sm">Ngày gửi đơn:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(detailModal.data.ngay_dang_ky).toLocaleString(
                      "vi-VN",
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setDetailModal({ show: false, data: null })}
                  className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 1. GIAO DIỆN QUẢN LÝ CHO ADMIN
  if (user?.role === "admin") {
    const filteredAdminDangKys = dangKys.filter((dk) => {
      const keyword = searchTerm.toLowerCase().trim();
      const maDon = String(dk.dang_ky_id || "").toLowerCase();
      const tenHocSinh = String(dk.ten_hoc_sinh || "").toLowerCase();
      const tenLop = String(
        dk.ten_lop || `Lớp #${dk.lop_hoc_id || ""}`,
      ).toLowerCase();
      const keywordMatch =
        !keyword ||
        maDon.includes(keyword) ||
        tenHocSinh.includes(keyword) ||
        tenLop.includes(keyword);

      if (adminFilter === "all") return true;
      if (adminFilter === "cancelled")
        return (
          keywordMatch &&
          (dk.trang_thai === "tu_choi" || dk.trang_thai === "da_huy")
        );
      return keywordMatch && dk.trang_thai === adminFilter;
    });

    return (
      <div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Duyệt đơn đăng ký lớp
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Quản lý yêu cầu đăng ký lớp học từ phụ huynh
              </p>
            </div>
          </div>

          <div className="p-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, học sinh, lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
                />
              </div>

              <div className="h-px md:h-10 md:w-px bg-gray-200" />

              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="md:w-64 px-4 py-2.5 bg-transparent focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="cho_duyet">Đang chờ duyệt</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="cancelled">Đã từ chối/hủy</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center border-b border-gray-200">
              <p className="text-gray-600 text-lg font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : filteredAdminDangKys.length === 0 ? (
            <div className="p-16 text-center border-b border-gray-200">
              <p className="text-gray-600 text-lg font-medium">
                Không có dữ liệu đăng ký lớp
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Thử thay đổi từ khóa hoặc bộ lọc trạng thái
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-b border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Học sinh
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Lớp đăng ký
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdminDangKys.map((dk, index) => (
                    <tr
                      key={dk.dang_ky_id}
                      className={`hover:bg-red-50/40 transition-colors duration-200 ${dk.trang_thai === "cho_duyet" ? "bg-amber-50/20" : ""}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        #{dk.dang_ky_id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {dk.ten_hoc_sinh}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="font-medium text-blue-700">
                          {dk.ten_lop || `Lớp #${dk.lop_hoc_id}`}
                        </span>
                        {dk.ten_mon_hoc && (
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {dk.ten_mon_hoc}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(dk.ngay_dang_ky).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(dk.trang_thai)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-[38px_92px_92px] items-center justify-center gap-2">
                          {/* NÚT CHI TIẾT CỦA ADMIN */}
                          <button
                            onClick={() =>
                              setDetailModal({ show: true, data: dk })
                            }
                            className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 text-xs font-bold rounded border border-gray-300 transition-colors shadow-sm flex items-center gap-1"
                            title="Xem chi tiết đơn"
                          >
                            <SearchIcon size={16} />
                          </button>

                          {dk.trang_thai === "cho_duyet" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(dk.dang_ky_id, "da_duyet")
                                }
                                className="w-[92px] h-10 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(dk.dang_ky_id, "tu_choi")
                                }
                                className="w-[92px] h-10 text-xs font-semibold bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          {dk.trang_thai === "da_duyet" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(dk.dang_ky_id, "da_huy")
                                }
                                className="w-[92px] h-10 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded-xl transition-colors"
                                title="Hủy đơn này để hoàn trả 1 sĩ số cho lớp"
                              >
                                Hủy đơn
                              </button>
                              <span className="w-[92px] h-10" />
                            </>
                          )}
                          {(dk.trang_thai === "tu_choi" ||
                            dk.trang_thai === "da_huy") && (
                            <>
                              <span className="w-[92px] h-10" />
                              <span className="w-[92px] h-10 inline-flex items-center justify-center text-xs text-gray-400 italic">
                                Đã đóng
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {renderPopups()}
        </div>
      </div>
    );
  }

  // 2. GIAO DIỆN PHỤ HUYNH
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 relative min-h-[500px]">
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex gap-6 list-none p-0 m-0">
          <li>
            <button
              onClick={() => setActiveTab("tim_lop")}
              className={cn(
                "flex items-center gap-1 pb-3 text-sm font-semibold transition-all duration-200",
                "before:content-['•'] before:text-lg before:leading-none",
                activeTab === "tim_lop"
                  ? "text-blue-600 before:text-blue-600"
                  : "text-gray-400 before:text-gray-400 hover:text-gray-600",
              )}
            >
              Tìm & Đăng ký lớp
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab("lich_su")}
              className={cn(
                "flex items-center gap-1 pb-3 text-sm font-semibold transition-all duration-200",
                "before:content-['•'] before:text-lg before:leading-none",
                activeTab === "lich_su"
                  ? "text-blue-600 before:text-blue-600"
                  : "text-gray-400 before:text-gray-400 hover:text-gray-600",
              )}
            >
              Lịch sử đăng ký
            </button>
          </li>
        </ul>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* TAB 1: TÌM KIẾM VÀ ĐĂNG KÝ */}
          {activeTab === "tim_lop" && (
            <div>
              <div className="mb-6 relative max-w-xl mx-auto md:mx-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm môn học (Toán, Lý...), tên gia sư hoặc tên lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLopHocs.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">
                      Không tìm thấy lớp học nào phù hợp.
                    </p>
                  </div>
                ) : null}

                {filteredLopHocs.map((lop) => (
                  <div
                    key={lop.lop_hoc_id}
                    className="border border-gray-200 rounded-2xl overflow-hidden transition-all flex flex-col bg-white group hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="from-blue-50 to-indigo-50 p-5 mt-4 pt-4 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-2xl">
                          MSL:{" "}
                          <span className="text-blue-700">
                            {lop.lop_hoc_id}
                          </span>
                        </h4>
                      </div>

                      <p className="text-sm flex items-center gap-1.5 mt-3">
                        <span className="flex gap-1.5 font-bold">
                          <BookCheck size={18} />
                          Môn:
                        </span>
                        <span>{lop.ten_mon_hoc || "Đang cập nhật"}</span>
                      </p>

                      <p className="text-sm text-gray-700 flex items-center gap-1.5 mt-1.5">
                        <span className="font-bold flex gap-1.5">
                          <User size={18} /> Gia sư:{" "}
                        </span>
                        <span>{lop.ten_gia_su || "Chưa xếp gia sư"}</span>
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-1.5 mt-1.5">
                        <span className="font-bold flex gap-1.5">
                          <GraduationCap size={18} />
                          Khối lớp:{" "}
                        </span>
                        <span>{lop.khoi_lop}</span>
                      </p>
                    </div>

                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-amber-500" /> Lịch
                          học
                        </div>
                        <span className="font-semibold text-gray-800">
                          {lop.lich_hoc_du_kien || "Chưa có lịch"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-500" /> Số học
                          viên
                        </div>
                        <span className="font-semibold text-gray-800">
                          {lop.so_luong_hien_tai} / {lop.so_luong_toi_da}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-emerald-500" /> Số
                          buổi
                        </div>
                        <span className="font-semibold text-gray-800">
                          {lop.so_buoi_hoc} buổi
                        </span>
                      </div>

                      <div className="mt-4 pt-4 flex items-center justify-between border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Học phí toàn khóa
                          </p>
                          <p className="font-bold text-lg">
                            {Number(lop.gia_toan_khoa).toLocaleString("vi-VN")}{" "}
                            đ
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLop(lop);
                            setShowDangKyModal(true);
                          }}
                          className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform active:scale-[0.99]"
                        >
                          Đăng ký
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LỊCH SỬ ĐĂNG KÝ */}
          {activeTab === "lich_su" && (
            <div className="space-y-4">
              {dangKys.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Bạn chưa gửi yêu cầu đăng ký nào.
                </p>
              ) : null}
              {dangKys.map((dk) => (
                <div
                  key={dk.dang_ky_id}
                  className="flex flex-col md:flex-row justify-between md:items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-4"
                >
                  <div>
                    {/* <p className="font-bold text-gray-800 text-lg mb-1">
                      {dk.ten_lop || `MSL: ${dk.lop_hoc_id}`}
                    </p> */}
                    <h4 className="font-bold text-[20px]">
                      MSL:{" "}
                      <span className="text-blue-700">{dk.lop_hoc_id}</span>
                    </h4>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <User size={14} className="text-blue-500" /> Bé{" "}
                      {dk.ten_hoc_sinh} • <Clock size={14} />{" "}
                      {new Date(dk.ngay_dang_ky).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(dk.trang_thai)}

                    <button
                      onClick={() => setDetailModal({ show: true, data: dk })}
                      className="text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <SearchIcon size={14} /> Chi tiết
                    </button>

                    {dk.trang_thai === "cho_duyet" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(dk.dang_ky_id, "da_huy")
                        }
                        className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                      >
                        Rút đơn đăng ký
                      </button>
                    )}
                    {dk.trang_thai === "da_duyet" && (
                      <button
                        // onClick={() =>
                        //   setAlertModal({
                        //     show: true,
                        //     message:
                        //       'Lớp này đã được duyệt. Vui lòng sang mục "Yêu Cầu Hỗ Trợ" để gửi đơn xin rút lớp!',
                        //     type: "success",
                        //   })
                        // }
                        onClick={() => {
                          toast.warning(
                            `Lớp này đã được duyệt. Vui lòng sang mục "Yêu Cầu Hỗ Trợ" để gửi đơn xin rút lớp!`,
                          );
                        }}
                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                      >
                        Xin rút lớp
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL ĐIỀN FORM ĐĂNG KÝ */}
      {showDangKyModal && selectedLop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="sm:w-full md:w-[450px] max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="font-semibold text-lg text-gray-900">
                Xác nhận đăng ký
              </h3>
              <button onClick={() => setShowDangKyModal(false)}>
                <X
                  size={22}
                  className="text-gray-400 hover:text-gray-600 transition"
                />
              </button>
            </div>

            <form onSubmit={handleDangKySubmit} className="pt-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2 pb-1">
                  Thông tin lớp học
                </p>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">MSL</span>
                  <span className="font-medium text-gray-800">
                    {selectedLop.ten_lop || selectedLop.lop_hoc_id}
                  </span>

                  <span className="text-gray-500">Môn</span>
                  <span className="font-medium text-gray-800">
                    {selectedLop.ten_mon_hoc}
                  </span>

                  <span className="text-gray-500">Gia sư</span>
                  <span className="font-medium text-gray-800">
                    {selectedLop.ten_gia_su}
                  </span>

                  <span className="text-gray-500">Khối lớp</span>
                  <span className="font-medium text-gray-800">
                    {selectedLop.khoi_lop}
                  </span>
                </div>

                <div className="mt-3 text-right">
                  <span className="text-sm text-gray-500">Học phí</span>
                  <p className="text-red-600 font-semibold text-base">
                    {Number(selectedLop.gia_toan_khoa).toLocaleString("vi-VN")}{" "}
                    đ
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn học sinh tham gia học{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedHocSinhId}
                  onChange={(e) => {
                    setSelectedHocSinhId(e.target.value);

                    if (e.target.value) {
                      setErrors((prev) => ({ ...prev, selectedHocSinhId: "" }));
                    }
                  }}
                  className={cn(
                    "w-full p-3 rounded-full bg-white shadow-inner text-black border transition focus:outline-none focus:ring-2 focus:ring-blue-400",
                    errors.selectedHocSinhId
                      ? "border-blue-500 focus:ring-2 focus:ring-blue-400"
                      : "border-gray-100",
                  )}
                >
                  <option value="">-- Click để chọn con của bạn --</option>

                  {hocSinhs.length === 0 ? (
                    <option value="" disabled>
                      Bạn chưa thêm hồ sơ học sinh nào!
                    </option>
                  ) : (
                    hocSinhs.map((hs) => (
                      <option key={hs.hoc_sinh_id} value={hs.hoc_sinh_id}>
                        {hs.ho_ten} (Mã HS: {hs.hoc_sinh_id})
                      </option>
                    ))
                  )}
                </select>
                {errors.selectedHocSinhId && (
                  <div className="mt-2 text-red-600 mb-1">
                    <p>{errors.selectedHocSinhId}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4 pt-2 italic">
                  *Hệ thống sẽ kiểm tra và từ chối nếu bé đã có trong lớp.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDangKyModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Đóng lại
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-95 transition shadow-md"
                >
                  Gửi Đơn Đăng Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renderPopups()}
    </div>
  );
}
