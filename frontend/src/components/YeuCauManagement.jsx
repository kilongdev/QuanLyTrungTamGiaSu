import { useState, useEffect } from "react";
import { yeuCauAPI } from "../api/yeucauApi";
import {
  Plus,
  X,
  Search,
  Trash2,
  Edit2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function YeuCauManagement({ user }) {
  const [yeuCaus, setYeuCaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  const currentUserId =
    user?.id ||
    user?.gia_su_id ||
    user?.phu_huynh_id ||
    user?.tai_khoan_id ||
    "1";
  const currentUserRole =
    user?.role === "admin" ? "phu_huynh" : user?.role || "phu_huynh";

  const [formData, setFormData] = useState({
    nguoi_tao_id: currentUserId,
    loai_nguoi_tao: currentUserRole,
    phan_loai: "mo_lop",
    tieu_de: "",
    noi_dung: "",
    trang_thai: "cho_duyet",
    nguoi_xu_ly_id: "1",
    ghi_chu_xu_ly: "",
  });

  useEffect(() => {
    fetchYeuCaus();
  }, []);

  const fetchYeuCaus = async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === "admin") {
        response = await yeuCauAPI.getAll();
      } else {
        const userId =
          user?.id ||
          user?.gia_su_id ||
          user?.phu_huynh_id ||
          user?.tai_khoan_id;
        response = await yeuCauAPI.getByNguoiTao(userId, user.role);
      }
      setYeuCaus(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu cầu:", error);
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        if (user?.role === "admin") {
          await yeuCauAPI.updateStatus(editingId, {
            trang_thai: formData.trang_thai,
            nguoi_xu_ly_id: user?.id || "1",
            ghi_chu_xu_ly: formData.ghi_chu_xu_ly,
          });
          toast.success("Cập nhật trạng thái yêu cầu thành công!");
        } else {
          await yeuCauAPI.update(editingId, {
            phan_loai: formData.phan_loai,
            tieu_de: formData.tieu_de,
            noi_dung: formData.noi_dung,
          });
          toast.success("Chỉnh sửa nội dung yêu cầu thành công!");
        }
      } else {
        if (!formData.tieu_de || !formData.noi_dung) {
          toast.warning("Vui lòng nhập đủ tiêu đề và nội dung");
          return;
        }
        await yeuCauAPI.create(formData);
        toast.success("Gửi yêu cầu thành công!");
      }

      setShowModal(false);
      resetForm();
      fetchYeuCaus();
    } catch (error) {
      console.error("Lỗi khi lưu yêu cầu:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu yêu cầu");
    }
  };

  const handleEdit = (yeuCau) => {
    setEditingId(yeuCau.yeu_cau_id);
    setFormData({
      ...formData,
      trang_thai: yeuCau.trang_thai || "cho_duyet",
      ghi_chu_xu_ly: yeuCau.ghi_chu_xu_ly || "",
      tieu_de: yeuCau.tieu_de,
      noi_dung: yeuCau.noi_dung,
      phan_loai: yeuCau.phan_loai || "mo_lop",
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      message: `Bạn có chắc chắn muốn xoá yêu cầu này?`,
      onConfirm: async () => {
        setConfirmModal({ show: false, message: "", onConfirm: null });

        const loadingToast = toast.loading("Đang xoá yêu cầu...");

        try {
          await yeuCauAPI.delete(id);

          toast.success("Xóa yêu cầu thành công!", {
            id: loadingToast,
          });

          fetchYeuCaus(); // hoặc fetchData()
        } catch (error) {
          toast.error(error.message || "Không thể xóa yêu cầu này", {
            id: loadingToast,
          });
        }
      },
    });
  };

  const resetForm = () => {
    const userId =
      user?.id ||
      user?.gia_su_id ||
      user?.phu_huynh_id ||
      user?.tai_khoan_id ||
      "1";
    setFormData({
      nguoi_tao_id: userId,
      loai_nguoi_tao: user?.role === "admin" ? "phu_huynh" : user?.role,
      phan_loai: "mo_lop",
      tieu_de: "",
      noi_dung: "",
      trang_thai: "cho_duyet",
      nguoi_xu_ly_id: "1",
      ghi_chu_xu_ly: "",
    });
    setEditingId(null);
  };

  // --- CÁC HÀM TIỆN ÍCH (LABEL & COLOR) ---
  const getPhanLoaiLabel = (phanLoai) => {
    const labels = {
      mo_lop: "Mở lớp mới",
      huy_lop: "Hủy lớp",
      nghi_day: "Xin nghỉ dạy",
      nghi_hoc: "Xin nghỉ học",
      khac: "Yêu cầu khác",
    };
    return labels[phanLoai] || phanLoai;
  };

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      cho_duyet: "Chờ xử lý",
      dang_xu_ly: "Đang xử lý",
      da_duyet: "Đã duyệt",
      tu_choi: "Từ chối",
      da_hoan_thanh: "Đã hoàn thành",
    };
    return labels[trangThai] || trangThai;
  };

  const getTrangThaiColor = (trangThai) => {
    const colors = {
      cho_duyet: "bg-yellow-100 text-yellow-700",
      dang_xu_ly: "bg-blue-100 text-blue-700",
      da_duyet: "bg-green-100 text-green-700",
      tu_choi: "bg-red-100 text-red-700",
      da_hoan_thanh: "bg-gray-200 text-gray-800",
    };
    return colors[trangThai] || "bg-gray-100 text-gray-700";
  };

  // Lọc dữ liệu theo search
  const filteredYeuCaus = yeuCaus.filter((yc) => {
    const keyword = searchTerm.toLowerCase().trim();
    const title = String(yc.tieu_de || "").toLowerCase();
    const creatorRole = String(yc.loai_nguoi_tao || "").toLowerCase();
    const type = String(yc.phan_loai || "").toLowerCase();

    const keywordMatch =
      !keyword ||
      title.includes(keyword) ||
      creatorRole.includes(keyword) ||
      type.includes(keyword);
    const statusMatch =
      selectedStatus === "all" || yc.trang_thai === selectedStatus;
    const typeMatch = selectedType === "all" || yc.phan_loai === selectedType;

    return keywordMatch && statusMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu yêu cầu...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Quản lý Yêu cầu hỗ trợ
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Tổng số: {yeuCaus.length} yêu cầu
            </p>
          </div>
          {user?.role !== "admin" && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md font-medium"
            >
              <Plus size={18} />
              Thêm yêu cầu mới
            </button>
          )}
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
                placeholder="Tìm theo tiêu đề, người gửi hoặc phân loại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
              />
            </div>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="md:w-56 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả phân loại</option>
              <option value="mo_lop">Mở lớp mới</option>
              <option value="huy_lop">Hủy lớp</option>
              <option value="nghi_day">Xin nghỉ dạy</option>
              <option value="nghi_hoc">Xin nghỉ học</option>
              <option value="khac">Yêu cầu khác</option>
            </select>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="md:w-56 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="cho_duyet">Chờ xử lý</option>
              <option value="dang_xu_ly">Đang xử lý</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
              <option value="da_hoan_thanh">Đã hoàn thành</option>
            </select>
          </div>
        </div>

        {filteredYeuCaus.length === 0 ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">
              Không có dữ liệu yêu cầu
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Thử thay đổi từ khóa hoặc bộ lọc nâng cao
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
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Người gửi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Phân loại
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
                {filteredYeuCaus.map((yc, index) => (
                  <tr
                    key={yc.yeu_cau_id}
                    className="hover:bg-red-50/40 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-[220px] max-w-[360px]">
                        <p
                          className="text-sm font-semibold text-gray-900 line-clamp-1"
                          title={yc.tieu_de}
                        >
                          {yc.tieu_de}
                        </p>
                        <p
                          className="text-xs text-gray-500 line-clamp-1 mt-0.5"
                          title={yc.noi_dung}
                        >
                          {yc.noi_dung}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare size={14} className="text-blue-500" />
                        {yc.loai_nguoi_tao === "gia_su"
                          ? "Gia sư"
                          : "Phụ huynh"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getPhanLoaiLabel(yc.phan_loai)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {yc.ngay_tao
                        ? new Date(yc.ngay_tao).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getTrangThaiColor(yc.trang_thai)}`}
                      >
                        {getTrangThaiLabel(yc.trang_thai)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {(user?.role === "admin" ||
                          (user?.role !== "admin" &&
                            yc.trang_thai === "cho_duyet")) && (
                          <button
                            onClick={() => handleEdit(yc)}
                            className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title={
                              user?.role === "admin"
                                ? "Xử lý/Cập nhật"
                                : "Chỉnh sửa nội dung"
                            }
                          >
                            <Edit2 size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(yc.yeu_cau_id)}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa yêu cầu"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 ">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Xác nhận Xoá
            </h3>
            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 mt-2">
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
                onClick={() =>
                  confirmModal.onConfirm && confirmModal.onConfirm()
                }
                className="flex-1 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Xử lý yêu cầu (Admin)" : "Tạo yêu cầu mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {user?.role !== "admin" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Người gửi
                      </label>
                      <select
                        value={formData.loai_nguoi_tao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loai_nguoi_tao: e.target.value,
                          })
                        }
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="phu_huynh">Phụ huynh</option>
                        <option value="gia_su">Gia sư</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại yêu cầu
                      </label>
                      <select
                        value={formData.phan_loai}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phan_loai: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mo_lop">Mở lớp mới</option>
                        <option value="khac">Khác</option>
                        {formData.loai_nguoi_tao === "phu_huynh" && (
                          <>
                            <option value="huy_lop">Hủy đăng ký lớp</option>
                            <option value="nghi_hoc">Xin nghỉ học</option>
                          </>
                        )}
                        {formData.loai_nguoi_tao === "gia_su" && (
                          <option value="nghi_day">Xin nghỉ dạy</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tieu_de}
                      onChange={(e) =>
                        setFormData({ ...formData, tieu_de: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tiêu đề ngắn gọn..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung chi tiết <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.noi_dung}
                      onChange={(e) =>
                        setFormData({ ...formData, noi_dung: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Mô tả chi tiết yêu cầu của bạn..."
                      required
                    ></textarea>
                  </div>
                </>
              )}

              {user?.role === "admin" && editingId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Tiêu đề yêu cầu:
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {formData.tieu_de}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cập nhật trạng thái
                    </label>
                    <select
                      value={formData.trang_thai}
                      onChange={(e) =>
                        setFormData({ ...formData, trang_thai: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="cho_duyet">Chờ xử lý</option>
                      <option value="dang_xu_ly">Đang xử lý</option>
                      <option value="da_duyet">Phê duyệt</option>
                      <option value="tu_choi">Từ chối</option>
                      <option value="da_hoan_thanh">Đã hoàn thành</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú của Admin
                    </label>
                    <textarea
                      value={formData.ghi_chu_xu_ly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ghi_chu_xu_ly: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Lý do duyệt/từ chối hoặc ghi chú..."
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId
                    ? user?.role === "admin"
                      ? "Lưu trạng thái"
                      : "Cập nhật nội dung"
                    : "Gửi yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
