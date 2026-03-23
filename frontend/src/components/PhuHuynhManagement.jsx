import { useState, useEffect } from "react";
import { Trash2, Edit2, Eye, Search, Plus, X } from "lucide-react";
import { phuHuynhAPI } from "@/api/phuHuynhApi";

export default function PhuHuynhManagement() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [studentCounts, setStudentCounts] = useState({}); // Lưu số học sinh của mỗi phụ huynh
  const [detailModal, setDetailModal] = useState({
    open: false,
    data: null,
    students: [],
    loading: false,
  });
  // State cho modal chỉnh sửa
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [editFormData, setEditFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",
  });
  const [modalLoading, setModalLoading] = useState(false);
  // State cho modal thêm mới
  const [addModal, setAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    ho_ten: "",
    email: "",
    mat_khau: "",
    so_dien_thoai: "",
    dia_chi: "",
  });

  // Lấy số học sinh thực tế của phụ huynh
  const fetchStudentCount = async (parentId) => {
    try {
      const data = await phuHuynhAPI.getById(parentId);

      if (data.status === "success") {
        const count = (data.data.hoc_sinh || []).length;
        return { parentId, count };
      }
      return { parentId, count: 0 };
    } catch (err) {
      console.error("Error fetching student count:", err);
      return { parentId, count: 0 };
    }
  };

  // Gọi API lấy danh sách phụ huynh
  const fetchParents = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const data = await phuHuynhAPI.getAll({
        page,
        limit: 10,
        search: searchTerm,
      });

      if (data.status === "success") {
        setParents(data.data);
        setPagination(data.pagination);
        setError(null);

        // Gọi API để lấy số học sinh thực tế cho mỗi phụ huynh
        const countPromises = data.data.map((parent) =>
          fetchStudentCount(parent.phu_huynh_id),
        );

        Promise.all(countPromises).then((results) => {
          const counts = {};
          results.forEach(({ parentId, count }) => {
            counts[parentId] = count;
          });
          setStudentCounts(counts);
        });
      } else {
        setError("Lỗi khi tải dữ liệu");
      }
    } catch (err) {
      setError("Không thể kết nối đến server: " + err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lấy chi tiết phụ huynh + danh sách học sinh
  const fetchParentDetail = async (parentId) => {
    try {
      setDetailModal((prev) => ({ ...prev, loading: true }));

      const data = await phuHuynhAPI.getById(parentId);

      if (data.status === "success") {
        setDetailModal({
          open: true,
          data: data.data,
          students: data.data.hoc_sinh || [],
          loading: false,
        });
      } else {
        setError("Lỗi khi tải chi tiết phụ huynh");
      }
    } catch (err) {
      setError("Không thể kết nối đến server: " + err.message);
      console.error("Fetch error:", err);
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Xử lý submit form thêm mới
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const result = await phuHuynhAPI.create(addFormData);
      if (result.status === "success") {
        alert("Thêm phụ huynh thành công!");
        setAddModal(false);
        setAddFormData({
          ho_ten: "",
          email: "",
          mat_khau: "",
          so_dien_thoai: "",
          dia_chi: "",
        });
        fetchParents(1, search);
      } else {
        throw new Error(result.message || "Thêm thất bại");
      }
    } catch (err) {
      alert("Lỗi khi thêm: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Xử lý click nút sửa
  const handleEdit = (parent) => {
    setEditFormData({
      ho_ten: parent.ho_ten,
      email: parent.email,
      so_dien_thoai: parent.so_dien_thoai || "",
      dia_chi: parent.dia_chi || "",
    });
    setEditModal({ open: true, data: parent });
  };

  // Xử lý submit form cập nhật
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.data) return;

    setModalLoading(true);
    try {
      const result = await phuHuynhAPI.update(
        editModal.data.phu_huynh_id,
        editFormData,
      );
      if (result.status === "success") {
        alert("Cập nhật thành công!");
        setEditModal({ open: false, data: null });
        fetchParents(pagination.page, search); // Tải lại danh sách
      } else {
        throw new Error(result.message || "Cập nhật thất bại");
      }
    } catch (err) {
      alert("Lỗi khi cập nhật: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Xử lý click nút xóa
  const handleDelete = async (parent) => {
    // Kiểm tra phía Client trước
    const studentCount = studentCounts[parent.phu_huynh_id] || 0;
    if (studentCount > 0) {
      alert(
        `Không thể xóa phụ huynh "${parent.ho_ten}" vì đang có ${studentCount} học sinh theo học.`,
      );
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa phụ huynh "${parent.ho_ten}"? Thao tác này không thể hoàn tác.`,
      )
    ) {
      try {
        setLoading(true);
        const result = await phuHuynhAPI.delete(parent.phu_huynh_id);
        if (result.status === "success") {
          alert("Xóa phụ huynh thành công!");
          fetchParents(pagination.page, search); // Tải lại danh sách
        } else {
          throw new Error(result.message || "Xóa thất bại");
        }
      } catch (err) {
        alert("Lỗi khi xóa phụ huynh: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchParents(1, "");
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    fetchParents(1, term);
  };

  // Xử lý đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchParents(newPage, search);
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Xử lý view detail
  const handleViewDetail = (parentId) => {
    fetchParentDetail(parentId);
  };

  // Đóng modal
  const closeModal = () => {
    setDetailModal({ open: false, data: null, students: [], loading: false });
  };

  // Tạo avatar từ tên
  const getAvatarInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Tạo màu avatar từ tên
  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-500 mt-4">Đang tải danh sách phụ huynh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          👨‍👩‍👧 Quản lý Phụ Huynh
        </h2>
        <button
          onClick={() => setAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Thêm phụ huynh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-4 border border-blue-100">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">⚠️ Lỗi</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
          <p className="text-sm opacity-90">Tổng phụ huynh</p>
          <p className="text-3xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md">
          <p className="text-sm opacity-90">Trang hiện tại</p>
          <p className="text-3xl font-bold">
            {pagination.page}/{pagination.totalPages}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
          <p className="text-sm opacity-90">Hiển thị</p>
          <p className="text-3xl font-bold">{parents.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {parents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              📭 Không có dữ liệu phụ huynh
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Hãy thêm phụ huynh mới hoặc thay đổi bộ lọc tìm kiếm
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Phụ Huynh
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Điện Thoại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Số Con
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parents.map((parent, index) => (
                  <tr
                    key={parent.phu_huynh_id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${getAvatarColor(parent.phu_huynh_id)} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md`}
                        >
                          {getAvatarInitials(parent.ho_ten)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {parent.ho_ten}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {parent.phu_huynh_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 break-words">
                        {parent.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {parent.so_dien_thoai || (
                          <span className="text-gray-400 italic">
                            Chưa cập nhật
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                        {studentCounts[parent.phu_huynh_id] !== undefined ? (
                          studentCounts[parent.phu_huynh_id]
                        ) : (
                          <span className="text-gray-400">⏳</span>
                        )}{" "}
                        👶
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 tooltip"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(parent.phu_huynh_id)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 tooltip"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(parent)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 tooltip"
                          title="Xóa"
                          onClick={() => handleDelete(parent)}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-md p-4 gap-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Trang {pagination.page}</span> /{" "}
            {pagination.totalPages}
            <span className="ml-2 text-gray-500">
              ({parents.length} trên {pagination.limit} kết quả)
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              ← Trước
            </button>
            <div className="flex items-center gap-2 px-3">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        pageNum === pagination.page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            {detailModal.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : detailModal.data ? (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div
                      className={`${getAvatarColor(detailModal.data.phu_huynh_id)} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg`}
                    >
                      {getAvatarInitials(detailModal.data.ho_ten)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {detailModal.data.ho_ten}
                      </h3>
                      <p className="text-blue-100">
                        ID: {detailModal.data.phu_huynh_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-blue-600 p-1 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="font-semibold text-gray-900">
                        {detailModal.data.email}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Điện thoại</p>
                      <p className="font-semibold text-gray-900">
                        {detailModal.data.so_dien_thoai || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Địa chỉ</p>
                      <p className="font-semibold text-gray-900">
                        {detailModal.data.dia_chi || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                      <p className="text-blue-600 text-sm font-bold">
                        Số học sinh
                      </p>
                      <p className="font-bold text-blue-900 text-2xl">
                        {detailModal.students.length} 👶
                      </p>
                    </div>
                  </div>

                  {/* Students List */}
                  {detailModal.students.length > 0 ? (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-3">
                        📚 Danh sách học sinh
                      </h4>
                      <div className="space-y-2">
                        {detailModal.students.map((student, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border-l-4 border-blue-500"
                          >
                            <p className="font-semibold text-gray-900">
                              {idx + 1}. {student.ho_ten || student.name}
                            </p>
                            {student.ten_lop && (
                              <p className="text-sm text-gray-600">
                                Lớp: {student.ten_lop}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <p className="text-yellow-800">
                        ℹ️ Phụ huynh này chưa có học sinh nào
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Đóng
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Chỉnh sửa
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Thêm phụ huynh mới
              </h3>
              <button
                onClick={() => setAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addFormData.ho_ten}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, ho_ten: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={addFormData.email}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={addFormData.mat_khau}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        mat_khau: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={addFormData.so_dien_thoai}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        so_dien_thoai: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={addFormData.dia_chi}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        dia_chi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Chỉnh sửa thông tin phụ huynh
              </h3>
              <button
                onClick={() => setEditModal({ open: false, data: null })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editFormData.ho_ten}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        ho_ten: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editFormData.so_dien_thoai}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        so_dien_thoai: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={editFormData.dia_chi}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dia_chi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, data: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
